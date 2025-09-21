import { describe, it, expect } from 'vitest'
import { safeTruncate, TELEGRAM_QUIZ_EXPLANATION_MAX_CHARS } from '../src/modules/infra/utils.js'

describe('safeTruncate', () => {
  it('does not split surrogate pairs (emoji)', () => {
    const s = 'Hello 😀 World'
    const idx = Array.from(s).indexOf('😀')
    const cut = idx + 1 // include emoji fully
    const out = safeTruncate(s, cut)
    expect(Array.from(out).includes('😀')).toBe(true)
    expect(out.length).toBeGreaterThan(0)
  })

  it('does not split regional indicator flags', () => {
    const flag = '🇧🇷'
    const s = `X${flag}Y`
    const out = safeTruncate(s, 2) // 'X' + full flag
    expect(out).toBe(`X${flag}`)
    // When truncating to 1 grapheme, the flag must not appear
    const out2 = safeTruncate(s, 1)
    expect(out2).toBe('X')
  })

  it('enforces max quiz explanation length', () => {
    const long = 'x'.repeat(1000)
    const out = safeTruncate(long, TELEGRAM_QUIZ_EXPLANATION_MAX_CHARS)
    expect(Array.from(out).length).toBeLessThanOrEqual(TELEGRAM_QUIZ_EXPLANATION_MAX_CHARS)
  })
})
