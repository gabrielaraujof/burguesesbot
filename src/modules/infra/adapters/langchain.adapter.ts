import type {
  AiProvider,
  AiResponse,
  GenerateOptions,
} from '../../ai/index.js'
import { AiError } from '../../ai/index.js'

import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { type BaseMessage } from '@langchain/core/messages'
import type { ProviderContent, Usage, ProviderResponse, StreamChunk } from './langchain.types.js'
import { toModelParams, buildMessages, extractTextContent, chunkToText, normalizeError } from './langchain.helpers.js'

export class LangChainGenAiProviderAdapter implements AiProvider {
  private readonly modelName: string
  private readonly defaultTimeout: number
  private readonly maxRetries: number

  constructor(params?: { modelName?: string; timeoutMs?: number; maxRetries?: number }) {
    this.modelName = params?.modelName || process.env.AI_MODEL || 'gemini-1.5-flash'
    this.defaultTimeout = params?.timeoutMs || parseInt(process.env.AI_TIMEOUT_MS || '30000')
    this.maxRetries = params?.maxRetries ?? 2
  }

  private includeUsage(): boolean {
    return process.env.AI_INCLUDE_USAGE === '1' || process.env.AI_INCLUDE_USAGE === 'true'
  }

  private createModel(options?: GenerateOptions) {
    return new ChatGoogleGenerativeAI({
      model: this.modelName,
      ...toModelParams(options),
      apiKey: process.env.GEMINI_API_KEY,
    })
  }

  private prepareModelCall(input: string, options?: GenerateOptions) {
    const model = this.createModel(options)
    const messages = this.buildMessages(input, options)
    const invokeOrStreamOptions: { signal: AbortSignal; stream_options?: { include_usage?: boolean } } = { signal: undefined as unknown as AbortSignal }
    if (this.includeUsage()) invokeOrStreamOptions.stream_options = { include_usage: true }
    return { model, messages, invokeOrStreamOptions }
  }

  private async callWithModel<T>(
    input: string,
    options: GenerateOptions | undefined,
    executor: (model: any, messages: BaseMessage[], signal: AbortSignal) => Promise<T>,
  ): Promise<T> {
    return this.withRetries(
      async () => {
        const { model, messages } = this.prepareModelCall(input, options)

        const res = await this.withAbortTimeout(
          (signal) => executor(model, messages, signal),
          this.defaultTimeout,
        )

        return res
      },
      (err) => {
        const aiErr = normalizeError(err)
        if (aiErr.code === 'timeout') return { retry: false }
        return { retry: Boolean((aiErr as { retry?: boolean }).retry) }
      },
      this.maxRetries,
    )
  }

  private buildMessages(input: string, options?: GenerateOptions): BaseMessage[] {
    return buildMessages(input, options)
  }

  private async withAbortTimeout<T>(fn: (signal: AbortSignal) => Promise<T>, timeoutMs: number): Promise<T> {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const res = await fn(controller.signal)
      clearTimeout(id)
      return res
    } catch (err: unknown) {
      clearTimeout(id)
      // Treat AbortError / timeout as AiError('timeout') for callers
      const name = (err as { name?: unknown })?.name
      const message = (err as { message?: unknown })?.message
      if (name === 'AbortError' || /timed out|Timeout/i.test(typeof message === 'string' ? message : '')) {
        throw new AiError(typeof message === 'string' ? message : 'Request timed out', 'timeout')
      }
      // Re-throw unknown errors as internal AiError to keep a consistent surface
      if (!(err instanceof AiError)) throw normalizeError(err)
      throw err
    }
  }

  private async withRetries<T>(op: () => Promise<T>, shouldRetry: (err: unknown) => { retry: boolean }, maxRetries: number) {
    let attempt = 0
    while (true) {
      attempt++
      try {
        return await op()
      } catch (err: unknown) {
        // Let the predicate decide whether to retry based on the raw error
        const info = shouldRetry(err)
        const aiErr = normalizeError(err)
        if (!info?.retry || attempt > maxRetries) throw aiErr
        const backoff = 200 * 2 ** (attempt - 1)
        await new Promise((r) => setTimeout(r, backoff))
      }
    }
  }

  private extractTextContent(content: ProviderContent): string {
    return extractTextContent(content)
  }

  private toAiResponse(res: unknown, includeUsage: boolean): AiResponse {
    // The provider response shape can vary between sync and stream flows.
    const maybe = res as ProviderResponse
    const text = this.extractTextContent(maybe?.content)
    const out: AiResponse = { text: String(text) }
    if (includeUsage && maybe?.usage) out.usage = maybe.usage as Usage
    return out
  }

  private async createStream(input: string, options?: GenerateOptions): Promise<AsyncIterable<StreamChunk>> {
    return this.callWithModel<AsyncIterable<StreamChunk>>(input, options, (model, messages, signal) => {
      const streamOptions: { signal: AbortSignal; stream_options?: { include_usage?: boolean } } = { signal }
      if (this.includeUsage()) streamOptions.stream_options = { include_usage: true }
      return model.stream(messages, streamOptions) as Promise<AsyncIterable<StreamChunk>>
    })
  }

  async generate(input: string, options?: GenerateOptions): Promise<AiResponse> {
    const res = await this.callWithModel<any>(input, options, (model, messages, signal) => {
      const invokeOptions: { signal: AbortSignal; stream_options?: { include_usage?: boolean } } = { signal }
      if (this.includeUsage()) invokeOptions.stream_options = { include_usage: true }
      return model.invoke(messages, invokeOptions)
    })

    return this.toAiResponse(res, this.includeUsage())
  }

  async *generateStream(input: string, options?: GenerateOptions): AsyncIterable<string> {
    const stream = await this.createStream(input, options)
    for await (const chunk of stream as AsyncIterable<StreamChunk>) {
      const piece = chunkToText(chunk)
      if (piece) yield piece
    }
    return
  }
}
