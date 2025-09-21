import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { VertexAiProviderAdapter } from '../src/modules/infra/adapters/service.adapters.js'
import { AiError } from '../src/modules/ai/index.js'

// Mock the new @google/genai library
vi.mock('@google/genai', () => {
  class MockModels {
    async generateContent(params: any) {
      ;(globalThis as any).__genaiMock = params
      
      const input = params.contents
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
      return { text: `Echo: ${input}` }
    }

    async *generateContentStream(params: any) {
      ;(globalThis as any).__genaiMock = params
      
      const input = params.contents
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
      
      // Simulate streaming chunks
      const response = `Echo: ${input}`
      const chunks = response.match(/.{1,5}/g) || [response]
      for (const chunk of chunks) {
        yield { text: chunk }
        await new Promise(r => setTimeout(r, 1))
      }
    }
  }

  class GoogleGenAI {
    models = new MockModels()
    constructor(_options: any) {}
  }
  
  return { GoogleGenAI }
})

beforeAll(() => {
  vi.stubEnv('AI_TIMEOUT_MS', '10')
  vi.stubEnv('VERTEXAI_API_KEY', 'test-key')
  vi.stubEnv('GOOGLE_CLOUD_PROJECT', 'test-project')
  vi.stubEnv('GOOGLE_CLOUD_LOCATION', 'us-central1')
})

afterAll(() => {
  vi.unstubAllEnvs()
})

describe('VertexAiProviderAdapter', () => {
  it('generates content with system instruction', async () => {
    const adapter = new VertexAiProviderAdapter({ timeoutMs: 100 })
    const { text } = await adapter.generate('hello', {
      system: 'You are a test system'
    })
    expect(text).toBe('Echo: hello')
    const captured = (globalThis as any).__genaiMock
    expect(captured.contents).toBe('hello')
    expect(captured.config.systemInstruction).toBe('You are a test system')
  })

  it('maps config values correctly', async () => {
    const adapter = new VertexAiProviderAdapter({ timeoutMs: 100 })
    await adapter.generate('config test', {
      config: { temperature: 0.1, topP: 0.9, topK: 50, maxTokens: 42, stopSequences: ['STOP'] }
    })
    const captured = (globalThis as any).__genaiMock
    expect(captured.config).toMatchObject({
      temperature: 0.1,
      topP: 0.9,
      topK: 50,
      maxOutputTokens: 42,
      stopSequences: ['STOP']
    })
  })

  it('includes thinking config for 2.5-flash models', async () => {
    const adapter = new VertexAiProviderAdapter({ modelName: 'gemini-2.5-flash-002', timeoutMs: 100 })
    await adapter.generate('thinking test')
    const captured = (globalThis as any).__genaiMock
    expect(captured.config.thinkingConfig).toMatchObject({
      thinkingBudget: -1,
      includeThoughts: false
    })
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

  it('streams content in chunks', async () => {
    const adapter = new VertexAiProviderAdapter({ timeoutMs: 100 })
    const gen = adapter.generateStream
    if (typeof gen !== 'function') {
      throw new Error('generateStream is not implemented on adapter')
    }
    const chunks: string[] = []
    for await (const chunk of gen.call(adapter, 'hello streaming')) {
      chunks.push(chunk)
    }
    expect(chunks.join('')).toBe('Echo: hello streaming')
    expect(chunks.length).toBeGreaterThan(1) // Should be chunked
  })
})
