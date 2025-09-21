import type {
  AiProvider,
  AiResponse,
  ChatMessage,
  GenerateOptions,
} from '../../ai/index.js'
import { AiError } from '../../ai/index.js'

// Lazy imports keep optional dependency lightweight for non-LangChain users
let ChatGoogleGenerativeAI: any
let HumanMessage: any
let SystemMessage: any
let AIMessage: any

async function ensureLangChain() {
  if (!ChatGoogleGenerativeAI) {
    const mod = await import('@langchain/google-genai')
    ChatGoogleGenerativeAI = mod.ChatGoogleGenerativeAI
  }
  if (!HumanMessage || !SystemMessage || !AIMessage) {
    const msgs = await import('@langchain/core/messages')
    HumanMessage = msgs.HumanMessage
    SystemMessage = msgs.SystemMessage
    AIMessage = msgs.AIMessage
  }
}

function mapHistory(history?: ChatMessage[]) {
  if (!history || history.length === 0) return [] as any[]
  const mapped: any[] = []
  for (const m of history) {
    if (m.role === 'user') mapped.push(new HumanMessage(m.content))
    else if (m.role === 'assistant') mapped.push(new AIMessage(m.content))
    // ignore system turns; we add SystemMessage from options.system if provided
  }
  return mapped
}

function toModelParams(options?: GenerateOptions) {
  const cfg = options?.config
  const params: Record<string, any> = {}
  if (cfg?.temperature != null) params.temperature = cfg.temperature
  if (cfg?.maxTokens != null) params.maxOutputTokens = cfg.maxTokens
  // Note: topP, topK, stopSequences supported by Google GenAI chat via params
  if (cfg?.topP != null) params.topP = cfg.topP
  if (cfg?.topK != null) params.topK = cfg.topK
  if (cfg?.stopSequences) params.stopSequences = cfg.stopSequences
  return params
}

function normalizeError(err: any): AiError & { retry?: boolean } {
  if (err instanceof AiError) return err
  const message = err?.message || 'Unknown AI error'
  const status = err?.status || err?.code
  if (/timed out|Timeout/i.test(message)) return new AiError(message, 'timeout')
  if (status === 401 || status === 403 || /unauthorized|forbidden|API key/i.test(message)) {
    return new AiError(message, 'unauthorized')
  }
  if (status === 429 || /rate/i.test(message)) {
    const e = new AiError(message, 'rate_limited')
    return Object.assign(e, { retry: true })
  }
  if (/blocked|safety/i.test(message)) return new AiError(message, 'blocked')
  if (/ENOTFOUND|ECONN|network|fetch failed/i.test(message)) {
    const e = new AiError(message, 'network')
    return Object.assign(e, { retry: true })
  }
  return new AiError(message, 'internal')
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

  async generate(input: string, options?: GenerateOptions): Promise<AiResponse> {
    await ensureLangChain()
    let attempt = 0

    while (true) {
      attempt++
      try {
        const model = new ChatGoogleGenerativeAI({
          model: this.modelName,
          ...toModelParams(options),
          apiKey: process.env.GOOGLE_API_KEY || process.env.VERTEXAI_API_KEY,
        })

        const messages: any[] = []
        if (options?.system) messages.push(new SystemMessage(options.system))
        messages.push(...mapHistory(options?.history))
        messages.push(new HumanMessage(input))

        const controller = new AbortController()
        const id = setTimeout(() => controller.abort(), this.defaultTimeout)
        try {
          const res = await model.invoke(messages, { signal: controller.signal })
          clearTimeout(id)
          const text = Array.isArray(res?.content)
            ? res.content.map((c: any) => (typeof c === 'string' ? c : c.text || '')).join('')
            : res?.content || ''
          return { text: String(text) }
        } catch (err: any) {
          clearTimeout(id)
          throw err
        }
      } catch (err: any) {
        const aiErr = normalizeError(err)
        if (aiErr.code === 'timeout') throw aiErr
        if ((aiErr as any).retry && attempt <= this.maxRetries) {
          await new Promise((r) => setTimeout(r, 200 * 2 ** (attempt - 1)))
          continue
        }
        throw aiErr
      }
    }
  }

  async *generateStream(input: string, options?: GenerateOptions): AsyncIterable<string> {
    await ensureLangChain()
    let attempt = 0
    while (true) {
      attempt++
      try {
        const model = new ChatGoogleGenerativeAI({
          model: this.modelName,
          ...toModelParams(options),
          apiKey: process.env.GOOGLE_API_KEY || process.env.VERTEXAI_API_KEY,
        })

        const messages: any[] = []
        if (options?.system) messages.push(new SystemMessage(options.system))
        messages.push(...mapHistory(options?.history))
        messages.push(new HumanMessage(input))

        const controller = new AbortController()
        const id = setTimeout(() => controller.abort(), this.defaultTimeout)
        try {
          const stream = await model.stream(messages, { signal: controller.signal })
          clearTimeout(id)
          for await (const chunk of stream as AsyncIterable<any>) {
            const piece = Array.isArray(chunk?.content)
              ? chunk.content.map((c: any) => (typeof c === 'string' ? c : c.text || '')).join('')
              : chunk?.content || ''
            if (piece) yield String(piece)
          }
          return
        } catch (err: any) {
          clearTimeout(id)
          throw err
        }
      } catch (err: any) {
        const aiErr = normalizeError(err)
        if (aiErr.code === 'timeout') throw aiErr
        if ((aiErr as any).retry && attempt <= this.maxRetries) {
          await new Promise((r) => setTimeout(r, 200 * 2 ** (attempt - 1)))
          continue
        }
        throw aiErr
      }
    }
  }
}
