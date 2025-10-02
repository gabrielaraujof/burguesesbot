import { describe, it, expect } from 'vitest'
import { extractTextContent, chunkToText } from '../src/modules/infra/adapters/langchain.extract.js'
import { mapHistory, toModelParams, buildMessages } from '../src/modules/infra/adapters/langchain.messages.js'
import type { ChatMessage } from '../src/modules/ai/index.js'

describe('langchain.extract helpers', () => {
  it('extracts plain string', () => {
    expect(extractTextContent('hello')).toBe('hello')
  })

  it('extracts nested arrays and objects', () => {
    const obj = { content: [{ text: 'a' }, 'b', { delta: 'c' }] }
    expect(extractTextContent(obj as any)).toBe('abc')
  })

  it('returns empty for unknown shapes', () => {
    expect(extractTextContent(null as any)).toBe('')
    expect(extractTextContent(undefined as any)).toBe('')
    expect(chunkToText({ foo: 'bar' } as any)).toBe('')
  })

  it('chunkToText pulls text or delegates to extractTextContent', () => {
    expect(chunkToText('x')).toBe('x')
    expect(chunkToText({ text: 'y' } as any)).toBe('y')
    expect(chunkToText({ content: 'z' } as any)).toBe('z')
  })
})

describe('langchain.messages helpers', () => {
  it('maps history to messages array', () => {
    const history: ChatMessage[] = [
      { role: 'user', content: 'hi' },
      { role: 'assistant', content: 'hello' },
    ]
    const mapped = mapHistory(history)
    expect(mapped.length).toBe(2)
  })

  it('toModelParams maps options correctly', () => {
    const opt = { config: { temperature: 0.5, maxTokens: 100, topP: 0.9, topK: 5, stopSequences: ['x'] } }
    const params = toModelParams(opt as any)
    expect(params.temperature).toBe(0.5)
    expect(params.maxOutputTokens).toBe(100)
    expect(params.topP).toBe(0.9)
    expect(params.topK).toBe(5)
    expect(params.stopSequences).toEqual(['x'])
  })

  it('buildMessages includes system and history and user message', () => {
    const out = buildMessages('ask', { system: 'sys', history: [{ role: 'user', content: 'h' }] } as any)
    expect(out.length).toBeGreaterThanOrEqual(2)
  })
})
