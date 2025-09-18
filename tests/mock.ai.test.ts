import { describe, it, expect } from 'vitest'
import { MockAiProvider } from '../src/modules/infra/mocks/ai.mock.js'
import type { GenerateOptions, ChatMessage } from '../src/modules/ai/index.js'

describe('MockAiProvider', () => {
  it('returns deterministic fallback for same inputs', async () => {
    const mock = new MockAiProvider()
    const history: ChatMessage[] = [
      { role: 'user', content: 'hello' },
      { role: 'assistant', content: 'world' },
      { role: 'system', content: 'ignored' }
    ]
    const opts: GenerateOptions = {
      system: 'sys',
      history,
      config: { temperature: 0.2, maxTokens: 16 }
    }
    const a = await mock.generate('input', opts)
    const b = await mock.generate('input', opts)
    expect(a.text).toEqual(b.text)
    expect(a.text.startsWith('mock:')).toBe(true)
  })

  it('changes fallback when config/history changes', async () => {
    const mock = new MockAiProvider()
    const a = await mock.generate('input', {
      system: 'sys',
      history: [ { role: 'user', content: 'hello' } ] as ChatMessage[],
      config: { temperature: 0.2 }
    })
    const b = await mock.generate('input', {
      system: 'sys',
      history: [ { role: 'user', content: 'hello' } ] as ChatMessage[],
      config: { temperature: 0.3 }
    })
    expect(a.text).not.toEqual(b.text)
  })

  it('honors setMockResponse overrides', async () => {
    const mock = new MockAiProvider()
    mock.setMockResponse('foo', 'bar')
    const res = await mock.generate('foo')
    expect(res.text).toBe('bar')
  })
})
