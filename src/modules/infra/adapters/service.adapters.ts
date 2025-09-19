import { text } from '../../ai/index.js'
import { getFreeGames } from '../../freegames/index.js'
import { getQuestions } from '../../trivia/index.js'
import { getOnlineMembers } from '../../whosplaying/index.js'
import type { 
  FreeGamesService, 
  TriviaService, 
  WhosplayingService 
} from '../controllers/events.controllers.js'
import { MockAiProvider } from '../mocks/ai.mock.js'
import type { AiProvider, GenerateOptions, ChatMessage, AiResponse } from '../../ai/index.js'
import { AiError } from '../../ai/index.js'

import { GoogleGenAI } from '@google/genai'

export class VertexAiProviderAdapter implements AiProvider {
  private readonly client: GoogleGenAI
  private readonly modelName: string
  private readonly defaultTimeout: number
  private readonly maxRetries: number

  constructor(params?: {
    modelName?: string
    timeoutMs?: number
    maxRetries?: number
  }) {
    const apiKey = process.env.VERTEXAI_API_KEY ?? ''
    
    // Try to configure for Vertex AI, but fallback to Developer API if needed
    if (process.env.GOOGLE_CLOUD_PROJECT && process.env.GOOGLE_CLOUD_LOCATION) {
      // Configure for Vertex AI using environment variables
      this.client = new GoogleGenAI({
        vertexai: true,
        project: process.env.GOOGLE_CLOUD_PROJECT,
        location: process.env.GOOGLE_CLOUD_LOCATION,
        apiKey: apiKey
      })
    } else {
      // Fallback to Developer API
      this.client = new GoogleGenAI({
        apiKey: apiKey
      })
    }
    
    // Choose model based on API configuration
    const defaultModel = (process.env.GOOGLE_CLOUD_PROJECT && process.env.GOOGLE_CLOUD_LOCATION) 
      ? 'gemini-2.5-flash-002'  // Vertex AI supports latest models
      : 'gemini-1.5-flash'      // Developer API - use stable model
    
    this.modelName = params?.modelName || process.env.AI_MODEL || defaultModel
    this.defaultTimeout = params?.timeoutMs || parseInt(process.env.AI_TIMEOUT_MS || '30000')
    this.maxRetries = params?.maxRetries ?? 2
  }

  async generate(input: string, options?: GenerateOptions): Promise<AiResponse> {
    let attempt = 0
    
    // retry loop with exponential backoff
    while (true) {
      attempt++
      try {
        const result = await this.callWithTimeout(async () => {
          return await this.client.models.generateContent({
            model: this.modelName,
            contents: input,
            config: this.buildGenerationConfig(options)
          })
        }, this.defaultTimeout)
        
        return { text: result.text || '' }
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

  async *generateStream(input: string, options?: GenerateOptions): AsyncIterable<string> {
    let attempt = 0
    
    while (true) {
      attempt++
      try {
        const stream = await this.callWithTimeout(async () => {
          return await this.client.models.generateContentStream({
            model: this.modelName,
            contents: input,
            config: this.buildGenerationConfig(options)
          })
        }, this.defaultTimeout)

        if (stream && typeof stream[Symbol.asyncIterator] === 'function') {
          for await (const chunk of stream as AsyncIterable<any>) {
            const chunkText = chunk.text || ''
            if (chunkText) yield chunkText
          }
          return
        }
        
        // Fallback: try to get text from stream object directly
        const fallbackText = (stream as any)?.text || ''
        if (fallbackText) yield fallbackText
        return
        
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

  private buildGenerationConfig(options?: GenerateOptions) {
    const config: any = {
      temperature: options?.config?.temperature || 0.75,
      topP: options?.config?.topP || 0.95,
      topK: options?.config?.topK || 64,
      maxOutputTokens: options?.config?.maxTokens || 250,
    }

    // Add thinking configuration for Gemini 2.5 Flash models only
    if (this.modelName.includes('2.5-flash')) {
      config.thinkingConfig = {
        thinkingBudget: -1, // Enable unlimited thinking
        includeThoughts: false // Don't include thinking in response
      }
    }

    if (options?.config?.stopSequences) {
      config.stopSequences = options.config.stopSequences
    }

    // Add system instruction if provided
    if (options?.system) {
      config.systemInstruction = options.system
    }

    return config
  }

  private async callWithTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> {
    let timeoutHandle: any
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(() => {
        reject(new AiError('AI request timed out', 'timeout'))
      }, timeoutMs)
    })
    
    try {
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
    aiProvider: new VertexAiProviderAdapter(),
    freeGamesService: new FreeGamesServiceAdapter(),
    triviaService: new TriviaServiceAdapter(),
    whosplayingService: new WhosplayingServiceAdapter()
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