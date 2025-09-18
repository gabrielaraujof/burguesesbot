import { generate, text } from '../../ai/index.js'
import { getFreeGames } from '../../freegames/index.js'
import { getQuestions } from '../../trivia/index.js'
import { getOnlineMembers } from '../../whosplaying/index.js'
import type { 
  FreeGamesService, 
  TriviaService, 
  WhosplayingService 
} from '../controllers/events.controllers.js'
import { MockAiService, MockAiProvider } from '../mocks/ai.mock.js'
import type { AiProvider, GenerateOptions, ChatMessage, AiResponse } from '../../ai/index.js'
import type { Content, GenerationConfig } from '@google/generative-ai'
import { AiError } from '../../ai/index.js'

// Temporary legacy interface pending removal (#58)
export interface AiService {
  generate(input: string, systemPrompt: string, history?: any[]): Promise<any>
}
import { GoogleGenerativeAI } from '@google/generative-ai'

export class AiServiceAdapter implements AiService {
  async generate(input: string, systemPrompt: string, history?: any[]): Promise<any> {
    return generate(input, systemPrompt, history)
  }
}

// Backwards compatibility adapter still used by legacy AiServiceAdapter above.

export class VertexAiProviderAdapter implements AiProvider {
  private readonly client: GoogleGenerativeAI
  private readonly modelName: string
  private readonly defaultTimeout: number
  private readonly defaultConfig: GenerationConfig
  private readonly maxRetries: number

  constructor(params?: {
    modelName?: string
    timeoutMs?: number
    defaultConfig?: Partial<GenerationConfig>
    maxRetries?: number
  }) {
    const apiKey = process.env.VERTEXAI_API_KEY ?? ''
    this.client = new GoogleGenerativeAI(apiKey)
    this.modelName = params?.modelName || process.env.AI_MODEL || 'gemini-2.5-flash'
    this.defaultTimeout = params?.timeoutMs || parseInt(process.env.AI_TIMEOUT_MS || '10000')
    this.maxRetries = params?.maxRetries ?? 2
    this.defaultConfig = {
      temperature: 0.75,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 250,
      responseMimeType: 'text/plain',
      ...params?.defaultConfig,
    }
  }

  async generate(input: string, options?: GenerateOptions): Promise<AiResponse> {
    const system = options?.system || ''
    const history = options?.history ? mapHistory(options.history) : undefined
    const generationConfig = this.buildGenerationConfig(options)
    const timeoutMs = this.defaultTimeout

    let attempt = 0
    // retry loop with exponential backoff
    while (true) {
      attempt++
      try {
        const result = await this.callWithTimeout(() => this.sendMessage({
          input,
          system,
          history,
          generationConfig,
        }), timeoutMs)
        return { text: text(result) }
      } catch (err: any) {
        const aiErr = this.normalizeError(err, attempt, this.maxRetries)
        if (aiErr.code === 'timeout') throw aiErr
        if (aiErr.retry && attempt <= this.maxRetries) {
          await this.sleep(200 * 2 ** (attempt - 1))
          continue
        }
        throw aiErr
      }
    }
  }

  private buildGenerationConfig(options?: GenerateOptions): GenerationConfig {
    const cfg = options?.config || {}
    return {
      ...this.defaultConfig,
      ...(cfg.temperature !== undefined ? { temperature: cfg.temperature } : {}),
      ...(cfg.topP !== undefined ? { topP: cfg.topP } : {}),
      ...(cfg.topK !== undefined ? { topK: cfg.topK } : {}),
      ...(cfg.maxTokens !== undefined ? { maxOutputTokens: cfg.maxTokens } : {}),
      ...(cfg.stopSequences ? { stopSequences: cfg.stopSequences } : {}),
    }
  }

  private async sendMessage(params: { input: string; system: string; history?: Content[]; generationConfig: GenerationConfig }) {
    const model = this.client.getGenerativeModel({
      model: this.modelName,
      systemInstruction: params.system,
    })
    const chat = model.startChat({
      generationConfig: params.generationConfig,
      history: params.history,
    })
    return chat.sendMessage(params.input)
  }

  private async callWithTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> {
    const controller = new AbortController()
    let timeoutHandle: any
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(() => {
        controller.abort()
        reject(new AiError('AI request timed out', 'timeout'))
      }, timeoutMs)
    })
    try {
      // The underlying SDK does not currently accept AbortSignal directly in our wrapper; abort is informational.
      return await Promise.race([fn(), timeoutPromise]) as T
    } finally {
      clearTimeout(timeoutHandle)
    }
  }

  private normalizeError(err: any, attempt: number, maxRetries: number): AiError & { retry?: boolean } {
    if (err instanceof AiError) return err
    const message = err?.message || 'Unknown AI error'
    const status = err?.status || err?.code
    // classification
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

const mapHistory = (history: ChatMessage[]): Content[] => {
  return history
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })) as Content[]
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
  return {
    aiService: new AiServiceAdapter(),
    aiProvider: new VertexAiProviderAdapter(),
    freeGamesService: new FreeGamesServiceAdapter(),
    triviaService: new TriviaServiceAdapter(),
    whosplayingService: new WhosplayingServiceAdapter()
  }
}

export const createDevServiceAdapters = () => {
  return {
    aiService: new MockAiService(),
    aiProvider: new MockAiProvider(),
    freeGamesService: new FreeGamesServiceAdapter(),
    triviaService: new TriviaServiceAdapter(),
    whosplayingService: new WhosplayingServiceAdapter(),
  }
}