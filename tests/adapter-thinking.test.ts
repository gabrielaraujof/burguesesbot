import { describe, it, expect } from 'vitest'
import { GoogleGenAiProviderAdapter } from '../src/modules/infra/adapters/service.adapters.js'

describe('supportsThinkingConfig', () => {
  const adapter = new GoogleGenAiProviderAdapter({ apiKey: 'test' } as any)

  const shouldMatch = [
    'gemini-2',
    'gemini-2.5',
    'gemini-2.5-flash',
    'gemini-2.5-flash-001',
    'GEMINI-2.5-FLASH-XYZ'
  ]

  const shouldNotMatch = [
    'gemini-2-vision',
    'gemini-2-vision-preview',
    'gpt-4',
    'some-other-model'
  ]

  it('matches expected gemini thinking-capable names', () => {
    shouldMatch.forEach((m) => expect((adapter as any).supportsThinkingConfig(m)).toBe(true))
  })

  it('does not match non-thinking names', () => {
    shouldNotMatch.forEach((m) => expect((adapter as any).supportsThinkingConfig(m)).toBe(false))
  })
})
