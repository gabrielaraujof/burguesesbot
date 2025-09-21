import { text } from '../../ai/index.js'
import { getFreeGames } from '../../freegames/index.js'
import { getQuestions } from '../../trivia/index.js'
import { getOnlineMembers } from '../../whosplaying/index.js'
import type {
  FreeGamesService,
  TriviaService,
  WhosplayingService,
} from '../controllers/events.controllers.js'
import { MockAiProvider } from '../mocks/ai.mock.js'
import type { AiProvider, GenerateOptions, AiResponse } from '../../ai/index.js'
import { AiError } from '../../ai/index.js'

import { GoogleGenAI } from '@google/genai'
import { LangChainGenAiProviderAdapter } from './langchain.adapter.js'

export class VertexAiProviderAdapter implements AiProvider {
  private readonly client: GoogleGenAI
  private readonly modelName: string
  private readonly defaultTimeout: number
  private readonly maxRetries: number

  private static extractChunkText(chunk: unknown): string {
    const anyChunk = chunk as any
    const t = typeof anyChunk?.text === 'function' ? anyChunk.text() : anyChunk?.text
    return typeof t === 'string' ? t : ''
  }

  private static extractFallbackText(stream: unknown): string {
    const t = (stream as any)?.text
    return typeof t === 'string' ? t : ''
  }

  private static isAsyncIterable<T = unknown>(obj: unknown): obj is AsyncIterable<T> {
    return !!obj && typeof (obj as any)[Symbol.asyncIterator] === 'function'
  }

  constructor(params?: {
    modelName?: string
    timeoutMs?: number
    maxRetries?: number
  }) {
    const apiKey = process.env.VERTEXAI_API_KEY ?? ''

    if (process.env.GOOGLE_CLOUD_PROJECT && process.env.GOOGLE_CLOUD_LOCATION) {
      this.client = new GoogleGenAI({
        vertexai: true,
        project: process.env.GOOGLE_CLOUD_PROJECT,
        location: process.env.GOOGLE_CLOUD_LOCATION,
        apiKey: apiKey,
      })
    } else {
      this.client = new GoogleGenAI({
        apiKey: apiKey,
      })
    }

    const defaultModel =
      process.env.GOOGLE_CLOUD_PROJECT && process.env.GOOGLE_CLOUD_LOCATION
        ? 'gemini-2.5-flash-002'
        : 'gemini-1.5-flash'

    this.modelName = params?.modelName || process.env.AI_MODEL || defaultModel
    this.defaultTimeout = params?.timeoutMs || parseInt(process.env.AI_TIMEOUT_MS || '30000')
    this.maxRetries = params?.maxRetries ?? 2
  }

  async generate(input: string, options?: GenerateOptions): Promise<AiResponse> {
    let attempt = 0

    while (true) {
      attempt++
      try {
        const contents = this.buildContents(input, options)
        const result = await this.callWithTimeout(async () => {
          return await this.client.models.generateContent({
            model: this.modelName,
            contents,
            config: this.buildGenerationConfig(options),
          })
        }, this.defaultTimeout)

        return { text: (result as any).text || '' }
      } catch (err: any) {
        const aiErr = this.normalizeError(err, attempt, this.maxRetries)
        if (aiErr.code === 'timeout') throw aiErr
        if ((aiErr as any).retry && attempt <= this.maxRetries) {
          await this.sleep(200 * 2 ** (attempt - 1))
          continue
        }
        throw aiErr
      }
    }
  }

  async *generateStream(input: string, options?: GenerateOptions): AsyncIterable<string> {
    let attempt = 0

    while (true) {
      attempt++
      try {
        const contents = this.buildContents(input, options)
        const stream = await this.callWithTimeout(async () => {
          return await this.client.models.generateContentStream({
            model: this.modelName,
            contents,
            config: this.buildGenerationConfig(options),
          })
        }, this.defaultTimeout)

        if (VertexAiProviderAdapter.isAsyncIterable(stream)) {
          for await (const chunk of (stream as AsyncIterable<unknown>)) {
            const chunkText = VertexAiProviderAdapter.extractChunkText(chunk)
            if (chunkText) yield chunkText
          }
          return
        }

        const fallbackText = VertexAiProviderAdapter.extractFallbackText(stream)
        if (fallbackText) yield fallbackText
        return
      } catch (err: any) {
        const aiErr = this.normalizeError(err, attempt, this.maxRetries)
        if (aiErr.code === 'timeout') throw aiErr
        if ((aiErr as any).retry && attempt <= this.maxRetries) {
          await this.sleep(200 * 2 ** (attempt - 1))
          continue
        }
        throw aiErr
      }
    }
  }

  private buildGenerationConfig(options?: GenerateOptions) {
    const config: any = {
      temperature: options?.config?.temperature || 0.75,
      topP: options?.config?.topP || 0.95,
      topK: options?.config?.topK || 64,
      maxOutputTokens: options?.config?.maxTokens || 250,
    }

    if (this.supportsThinkingConfig(this.modelName)) {
      config.thinkingConfig = {
        thinkingBudget: -1,
        includeThoughts: false,
      }
    }

    if (options?.config?.stopSequences) {
      config.stopSequences = options.config.stopSequences
    }

    if (options?.system) {
      config.systemInstruction = options.system
    }

    return config
  }

  private buildContents(input: string, options?: GenerateOptions) {
    const history = options?.history
    if (!history || history.length === 0) return input
    const lines: string[] = []
    for (const m of history) {
      if (m.role === 'user') lines.push(`User: ${m.content}`)
      else if (m.role === 'assistant') lines.push(`Assistant: ${m.content}`)
    }
    lines.push(`User: ${input}`)
    return lines.join('\n')
  }

  private supportsThinkingConfig(modelName: string): boolean {
    return /^gemini-2\.5-flash(?:-\d+)?$/i.test(modelName)
  }

  private async callWithTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> {
    let timeoutHandle: any
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(() => {
        reject(new AiError('AI request timed out', 'timeout'))
      }, timeoutMs)
    })

    try {
      return (await Promise.race([fn(), timeoutPromise])) as T
    } finally {
      clearTimeout(timeoutHandle)
    }
  }

  private normalizeError(
    err: any,
    attempt: number,
    maxRetries: number,
  ): AiError & { retry?: boolean } {
    if (err instanceof AiError) return err
    const message = err?.message || 'Unknown AI error'
    const status = err?.status || err?.code

    if (message.includes('timed out')) return new AiError(message, 'timeout')
    if (status === 401 || status === 403 || /unauthorized|forbidden|API key/i.test(message)) {
      return new AiError(message, 'unauthorized')
    }
    if (status === 429 || /rate/i.test(message)) {
      const e = new AiError(message, 'rate_limited')
      return Object.assign(e, { retry: attempt <= maxRetries })
    }
    if (/blocked|safety/i.test(message)) {
      return new AiError(message, 'blocked')
    }
    if (/ENOTFOUND|ECONN|network|fetch failed/i.test(message)) {
      const e = new AiError(message, 'network')
      return Object.assign(e, { retry: attempt <= maxRetries })
    }
    return new AiError(message, 'internal')
  }

  private sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms))
  }
}

export class FreeGamesServiceAdapter implements FreeGamesService {
  async getFreeGames(): Promise<any[]> {
    return getFreeGames()
  }
}

export class TriviaServiceAdapter implements TriviaService {
  async getQuestions(options: any): Promise<any[]> {
    return getQuestions(options)
  }
}

export class WhosplayingServiceAdapter implements WhosplayingService {
  async getOnlineMembers(): Promise<any[]> {
    return getOnlineMembers()
  }
}

export const createServiceAdapters = () => {
  const useLangChain =
    (process.env.AI_PROVIDER || '').toLowerCase() === 'langchain' ||
    (process.env.USE_LANGCHAIN || '').toLowerCase() === 'true'

  return {
    aiProvider: useLangChain
      ? new LangChainGenAiProviderAdapter()
      : new VertexAiProviderAdapter(),
    freeGamesService: new FreeGamesServiceAdapter(),
    triviaService: new TriviaServiceAdapter(),
    whosplayingService: new WhosplayingServiceAdapter(),
  }
}

export const createDevServiceAdapters = () => {
  return {
    aiProvider: new MockAiProvider(),
    freeGamesService: new FreeGamesServiceAdapter(),
    triviaService: new TriviaServiceAdapter(),
    whosplayingService: new WhosplayingServiceAdapter(),
  }
}
