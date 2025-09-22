import type {
  AiProvider,
  AiResponse,
  ChatMessage,
  GenerateOptions,
} from '../../ai/index.js'
import { AiError } from '../../ai/index.js'

// Use official library types (type-only) while keeping runtime dynamic imports
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { HumanMessage, SystemMessage, AIMessage, type BaseMessage } from '@langchain/core/messages'

// Minimal provider response types to avoid broad `any` usage while keeping flexibility
type ProviderTextChunk = string | { text?: string } | { content?: ProviderContent } | { delta?: ProviderContent }
type ProviderContent = Array<string | { text?: string } | { content?: ProviderContent } | { delta?: ProviderContent }> | string | { text?: string } | null | undefined
type Usage = { promptTokens?: number; completionTokens?: number; totalTokens?: number } | Record<string, number>
type ProviderResponse = { content?: ProviderContent; usage?: Usage }

type StreamChunk =
  | { content?: ProviderContent }
  | { delta?: ProviderContent }
  | { text?: string }
  | string

interface ModelParams {
  temperature?: number
  maxOutputTokens?: number
  topP?: number
  topK?: number
  stopSequences?: string[]
}

function mapHistory(history?: ChatMessage[]): BaseMessage[] {
  if (!history || history.length === 0) return [] as BaseMessage[]
  const mapped: BaseMessage[] = []
  for (const m of history) {
    if (m.role === 'user') mapped.push(new HumanMessage(m.content))
    else if (m.role === 'assistant') mapped.push(new AIMessage(m.content))
  }
  return mapped
}

function toModelParams(options?: GenerateOptions) {
  const cfg = options?.config
  const params: Record<string, any> = {}
  if (cfg?.temperature != null) params.temperature = cfg.temperature
  // Map provider-agnostic `maxTokens` → LangChain / Google `maxOutputTokens`
  if (cfg?.maxTokens != null) params.maxOutputTokens = cfg.maxTokens
  if (cfg?.topP != null) params.topP = cfg.topP
  if (cfg?.topK != null) params.topK = cfg.topK
  if (cfg?.stopSequences) params.stopSequences = cfg.stopSequences
  return params
}

function normalizeError(err: unknown): AiError & { retry?: boolean } {
  if (err instanceof AiError) return err
  const message = (err as { message?: unknown })?.message
  const msgStr = typeof message === 'string' ? message : 'Unknown AI error'
  const status = (err as { status?: unknown })?.status ?? (err as { code?: unknown })?.code

  const isTimeout = () => /timed out|Timeout/i.test(msgStr) || (err as any)?.name === 'AbortError'
  const isUnauthorized = () => status === 401 || status === 403 || /unauthorized|forbidden|API key/i.test(msgStr)
  const isRateLimited = () => status === 429 || /rate/i.test(msgStr)
  const isBlocked = () => /blocked|safety/i.test(msgStr)
  const isNetwork = () => /ENOTFOUND|ECONN|network|fetch failed/i.test(msgStr)

  if (isTimeout()) return new AiError(msgStr, 'timeout')
  if (isUnauthorized()) return new AiError(msgStr, 'unauthorized')
  if (isRateLimited()) {
    const e = new AiError(msgStr, 'rate_limited')
    return Object.assign(e, { retry: true })
  }
  if (isBlocked()) return new AiError(msgStr, 'blocked')
  if (isNetwork()) {
    const e = new AiError(msgStr, 'network')
    return Object.assign(e, { retry: true })
  }
  return new AiError(msgStr, 'internal')
}

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

  private buildMessages(input: string, options?: GenerateOptions): BaseMessage[] {
    const messages: BaseMessage[] = []
    if (options?.system) messages.push(new SystemMessage(options.system))
    messages.push(...mapHistory(options?.history))
    messages.push(new HumanMessage(input))
    return messages
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
    if (content == null) return ''
    if (typeof content === 'string') return content
    if (Array.isArray(content)) {
      return content
        .map((c: unknown) => {
          if (typeof c === 'string') return c
          if (c && typeof (c as { text?: unknown }).text === 'string') return (c as { text?: string }).text
          if (c && typeof (c as { content?: unknown }).content !== 'undefined') return this.extractTextContent((c as { content?: ProviderContent }).content)
          if (c && typeof (c as { delta?: unknown }).delta !== 'undefined') return this.extractTextContent((c as { delta?: ProviderContent }).delta)
          return ''
        })
        .join('')
    }
    if (typeof content === 'object' && (content as { text?: string }).text) return String((content as { text?: string }).text)
    return String(content)
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
    return this.withRetries(
      async () => {
        const model = this.createModel(options)
        const messages = this.buildMessages(input, options)

        const stream = await this.withAbortTimeout(
          (signal) => {
            const streamOptions: { signal: AbortSignal; stream_options?: { include_usage?: boolean } } = { signal }
            if (this.includeUsage()) streamOptions.stream_options = { include_usage: true }
            return model.stream(messages, streamOptions) as Promise<AsyncIterable<StreamChunk>>
          },
          this.defaultTimeout,
        )
        return stream
      },
      (err) => {
        const aiErr = normalizeError(err)
        if (aiErr.code === 'timeout') return { retry: false }
        return { retry: Boolean((aiErr as { retry?: boolean }).retry) }
      },
      this.maxRetries,
    )
  }

  async generate(input: string, options?: GenerateOptions): Promise<AiResponse> {
    
    return this.withRetries(
      async () => {
        const model = this.createModel(options)
        const messages = this.buildMessages(input, options)

        const res = await this.withAbortTimeout(
          (signal) => {
            const invokeOptions: { signal: AbortSignal; stream_options?: { include_usage?: boolean } } = { signal }
            if (this.includeUsage()) invokeOptions.stream_options = { include_usage: true }
            return model.invoke(messages, invokeOptions)
          },
          this.defaultTimeout,
        )

        return this.toAiResponse(res, this.includeUsage())
      },
      (err) => {
        const aiErr = normalizeError(err)
        if (aiErr.code === 'timeout') return { retry: false }
        return { retry: Boolean((aiErr as { retry?: boolean }).retry) }
      },
      this.maxRetries,
    )
  }

  async *generateStream(input: string, options?: GenerateOptions): AsyncIterable<string> {
    const stream = await this.createStream(input, options)
    for await (const chunk of stream as AsyncIterable<StreamChunk>) {
      let piece = ''
      if (typeof chunk === 'string') piece = chunk
      else if (chunk && typeof (chunk as { text?: unknown }).text === 'string') piece = String((chunk as { text?: string }).text)
      else if (chunk && typeof (chunk as { content?: unknown }).content !== 'undefined') piece = this.extractTextContent((chunk as { content?: ProviderContent }).content)
      else if (chunk && typeof (chunk as { delta?: unknown }).delta !== 'undefined') piece = this.extractTextContent((chunk as { delta?: ProviderContent }).delta)
      if (piece) yield String(piece)
    }
    return
  }
}
