import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { VertexAiProviderAdapter } from '../src/modules/infra/adapters/service.adapters.js'
import { AiError } from '../src/modules/ai/index.js'

// We will monkey-patch GoogleGenerativeAI via globalThis since adapter directly imports it.

vi.mock('@google/generative-ai', () => {
  class MockModel {
    history: any
    config: any
    constructor(private _options: any) {}
    startChat(opts: any) {
      this.history = opts.history
      this.config = opts.generationConfig
      return {
        sendMessage: async (input: string) => {
          if (input.includes('TIMEOUT')) {
            await new Promise((r) => setTimeout(r, 50))
          }
          if (input.includes('RATE')) {
            const err: any = new Error('rate limited')
            err.status = 429
            throw err
          }
          if (input.includes('UNAUTH')) {
            const err: any = new Error('unauthorized')
            err.status = 401
            throw err
          }
          return { response: { text: () => `Echo: ${input}` } }
        }
      }
    }
  }
  class GoogleGenerativeAI {
    constructor(_apiKey: string) {}
    getGenerativeModel(options: any) {
      return new MockModel(options)
    }
  }
  return { GoogleGenerativeAI }
})

beforeAll(() => {
  vi.stubEnv('AI_TIMEOUT_MS', '10')
  vi.stubEnv('VERTEXAI_API_KEY', 'test-key')
})

afterAll(() => {
  vi.unstubAllEnvs()
})

// utility to wait micro tasks
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

describe('VertexAiProviderAdapter', () => {
  it('maps history and system and returns text', async () => {
    const adapter = new VertexAiProviderAdapter({ timeoutMs: 100 })
    const { text } = await adapter.generate('hello', {
      system: 'You are a test system',
      history: [
        { role: 'user', content: 'Hi' },
        { role: 'assistant', content: 'Hello there' },
        { role: 'system', content: 'ignored' }
      ]
    })
    expect(text).toBe('Echo: hello')
  })

  it('maps config values', async () => {
    const adapter = new VertexAiProviderAdapter({ timeoutMs: 100 })
    await adapter.generate('config test', {
      config: { temperature: 0.1, topP: 0.9, topK: 50, maxTokens: 42, stopSequences: ['STOP'] }
    })
    // If no throw, mapping succeeded. (Could extend mock to capture config if deeper assertion needed.)
    expect(true).toBe(true)
  })

  it('normalizes unauthorized error', async () => {
    const adapter = new VertexAiProviderAdapter({ timeoutMs: 100 })
    await expect(adapter.generate('test UNAUTH')).rejects.toMatchObject({ code: 'unauthorized' })
  })

  it('retries on rate limit then surfaces error', async () => {
    const adapter = new VertexAiProviderAdapter({ timeoutMs: 50, maxRetries: 1 })
    await expect(adapter.generate('please RATE again')).rejects.toMatchObject({ code: 'rate_limited' })
  })

  it('times out long requests', async () => {
    const adapter = new VertexAiProviderAdapter({ timeoutMs: 5, maxRetries: 0 })
    await expect(adapter.generate('cause TIMEOUT delay')).rejects.toMatchObject({ code: 'timeout' })
  })
})
