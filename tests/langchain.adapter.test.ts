import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { LangChainGenAiProviderAdapter } from '../src/modules/infra/adapters/langchain.adapter.js'

// Mocks for @langchain/google-genai and @langchain/core/messages
class MockLLM {
  config: any
  constructor(config: any) {
    this.config = config
  }
  async invoke(messages: any[], options?: any) {
    ;(globalThis as any).__lcMock = { messages, config: this.config, options }
    const last = messages[messages.length - 1]
    const content = typeof last === 'string' ? last : last?.content || ''

    const job = (async () => {
      if (String(content).includes('TIMEOUT')) {
        // simulate a slow model call
        await new Promise((r) => setTimeout(r, 50))
      }
      if (String(content).includes('UNAUTH')) {
        const err: any = new Error('unauthorized')
        err.status = 401
        throw err
      }
      if (String(content).includes('RATE')) {
        const err: any = new Error('rate limited')
        err.status = 429
        throw err
      }
      return { content: `LC Echo: ${content}` }
    })()

    if (options?.signal) {
      const abortPromise = new Promise((_res, reject) => {
        if (options.signal.aborted) return reject(new Error('timed out'))
        options.signal.addEventListener('abort', () => reject(new Error('timed out')))
      })
      return Promise.race([job, abortPromise])
    }

    return job
  }
  async stream(messages: any[], options?: any) {
  ;(globalThis as any).__lcMock = { messages, config: this.config, options }
    const last = messages[messages.length - 1]
    const content = typeof last === 'string' ? last : last?.content || ''
    async function* gen() {
      const response = `LC Echo: ${content}`
      const chunks = response.match(/.{1,4}/g) || [response]
      for (const c of chunks) {
        yield { content: c }
      }
    }
    return gen()
  }
}

vi.mock('@langchain/google-genai', () => ({
  ChatGoogleGenerativeAI: MockLLM,
}))

vi.mock('@langchain/core/messages', () => ({
  HumanMessage: class HumanMessage {
    content: string
    constructor(content: string) { this.content = content }
  },
  SystemMessage: class SystemMessage {
    content: string
    constructor(content: string) { this.content = content }
  },
  AIMessage: class AIMessage {
    content: string
    constructor(content: string) { this.content = content }
  }
}))

beforeAll(() => {
  vi.stubEnv('USE_LANGCHAIN', 'true')
})

afterAll(() => {
  vi.unstubAllEnvs()
})

describe('LangChainGenAiProviderAdapter', () => {
  it('generates content with system and config', async () => {
    const adapter = new LangChainGenAiProviderAdapter({ timeoutMs: 200 })
    const res = await adapter.generate('hello')
    expect(res.text).toBe('LC Echo: hello')
    const captured = (globalThis as any).__lcMock
    expect(captured.config.model).toBeDefined()
  })

  it('streams content in chunks', async () => {
    const adapter = new LangChainGenAiProviderAdapter({ timeoutMs: 200 })
    const chunks: string[] = []
    for await (const ch of adapter.generateStream!('stream me')) {
      chunks.push(ch)
    }
    expect(chunks.join('')).toBe('LC Echo: stream me')
    expect(chunks.length).toBeGreaterThan(1)
  })

  it('passes include_usage when AI_INCLUDE_USAGE is enabled', async () => {
    const adapter = new LangChainGenAiProviderAdapter({ timeoutMs: 200 })
    // enable opt-in usage metadata
    process.env.AI_INCLUDE_USAGE = '1'
    const chunks: string[] = []
    for await (const ch of adapter.generateStream!('usage test')) {
      chunks.push(ch)
    }
  ;(globalThis as any).__lcMock = undefined
    const res = await adapter.generate('usage test (sync)')
  delete process.env.AI_INCLUDE_USAGE
    expect((globalThis as any).__lcMock.options).toBeDefined()
    expect((globalThis as any).__lcMock.options.stream_options).toBeDefined()
    expect((globalThis as any).__lcMock.options.stream_options.include_usage).toBe(true)
    // If the mock returned usage, adapter should surface it
    if (res.usage) {
      expect(res.usage).toBeDefined()
    }
  })

  it('maps config values and system/history correctly', async () => {
    const adapter = new LangChainGenAiProviderAdapter({ timeoutMs: 200 })
  const history = [{ role: 'user', content: 'past user' }, { role: 'assistant', content: 'past assistant' }]
  const res = await adapter.generate('current input', { system: 'sys-msg', history: history as any, config: { temperature: 0.2, topP: 0.8, topK: 10, maxTokens: 50, stopSequences: ['X'] } })
    expect(res.text).toContain('LC Echo:')
    const captured = (globalThis as any).__lcMock
    // constructor config should include mapped params
    expect(captured.config.temperature).toBe(0.2)
    expect(captured.config.topP).toBe(0.8)
    expect(captured.config.topK).toBe(10)
    expect(captured.config.maxOutputTokens).toBe(50)
    expect(captured.config.stopSequences).toEqual(['X'])
    // messages should include system and history mapped to messages array
    const msgs = captured.messages
    expect(String(msgs[0].content)).toBe('sys-msg')
    expect(String(msgs[msgs.length - 2].content)).toBe('past assistant')
    expect(String(msgs[msgs.length - 1].content)).toBe('current input')
  })

  it('normalizes unauthorized error', async () => {
    const adapter = new LangChainGenAiProviderAdapter({ timeoutMs: 200 })
    await expect(adapter.generate('UNAUTH')).rejects.toMatchObject({ code: 'unauthorized' })
  })

  it('retries on rate limit then surfaces error', async () => {
    const adapter = new LangChainGenAiProviderAdapter({ timeoutMs: 200, maxRetries: 1 })
    await expect(adapter.generate('please RATE again')).rejects.toMatchObject({ code: 'rate_limited' })
  })

  it('times out long requests', async () => {
    // Make the adapter timeout small so the mock's delay triggers abort
    const adapter = new LangChainGenAiProviderAdapter({ timeoutMs: 5, maxRetries: 0 })
    await expect(adapter.generate('cause TIMEOUT delay')).rejects.toMatchObject({ code: 'timeout' })
  })
})
