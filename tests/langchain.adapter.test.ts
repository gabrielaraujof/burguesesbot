import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { LangChainGenAiProviderAdapter } from '../src/modules/infra/adapters/langchain.adapter.js'

// Mocks for @langchain/google-genai and @langchain/core/messages
class MockLLM {
  config: any
  constructor(config: any) {
    this.config = config
  }
  async invoke(messages: any[]) {
    ;(globalThis as any).__lcMock = { messages, config: this.config }
    const last = messages[messages.length - 1]
    const content = typeof last === 'string' ? last : last?.content || ''
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
  }
  async stream(messages: any[]) {
    ;(globalThis as any).__lcMock = { messages, config: this.config }
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
})
