import { describe, it, expect } from 'vitest'
import {
  isTimeout,
  isUnauthorized,
  isRateLimited,
  isBlocked,
  isNetwork,
  classifyAiError,
  TIMEOUT_RE,
  UNAUTHORIZED_RE,
  RATE_RE,
  BLOCKED_RE,
  NETWORK_RE,
} from '../src/modules/infra/adapters/langchain.error.js'

describe('langchain.error predicates', () => {
  it('matches timeout messages and AbortError name', () => {
    expect(isTimeout(new Error('request timed out'), 'request timed out')).toBe(true)
    expect(isTimeout({ name: 'AbortError' }, 'whatever')).toBe(true)
    expect(TIMEOUT_RE.test('timed out')).toBe(true)
  })

  it('detects unauthorized by status or message', () => {
    expect(isUnauthorized(null, 401, 'no message')).toBe(true)
    expect(isUnauthorized(null, 403, 'no message')).toBe(true)
    expect(isUnauthorized(null, null, 'unauthorized access')).toBe(true)
    expect(UNAUTHORIZED_RE.test('forbidden')).toBe(true)
  })

  it('detects rate limiting', () => {
    expect(isRateLimited(null, 429, 'x')).toBe(true)
    expect(isRateLimited(null, null, 'Rate exceeded')).toBe(true)
    expect(RATE_RE.test('rate limit')).toBe(true)
  })

  it('detects blocked and safety phrases', () => {
    expect(isBlocked(null, 'blocked by policy')).toBe(true)
    expect(BLOCKED_RE.test('safety')).toBe(true)
  })

  it('detects network errors', () => {
    expect(isNetwork(null, 'ENOTFOUND')).toBe(true)
    expect(isNetwork(null, 'fetch failed: reason')).toBe(true)
    expect(NETWORK_RE.test('ECONNRESET')).toBe(true)
  })
})

describe('classifyAiError ordering and flags', () => {
  it('classifies timeout first with no retry', () => {
    const e = { message: 'timed out while fetching' }
    const cls = classifyAiError(e)
    expect(cls.code).toBe('timeout')
    expect(cls.retry).toBeUndefined()
  })

  it('classifies rate_limited with retry=true', () => {
    const e = { message: 'Rate limit exceeded' }
    const cls = classifyAiError(e)
    expect(cls.code).toBe('rate_limited')
    expect(cls.retry).toBe(true)
  })

  it('classifies network as retry=true', () => {
    const e = { message: 'ENOTFOUND' }
    const cls = classifyAiError(e)
    expect(cls.code).toBe('network')
    expect(cls.retry).toBe(true)
  })

  it('prioritizes unauthorized over rate when status is 401', () => {
    const e = { message: 'rate', status: 401 }
    const cls = classifyAiError(e)
    expect(cls.code).toBe('unauthorized')
  })

  it('falls back to internal for unknown shapes', () => {
    const cls = classifyAiError(undefined)
    expect(cls.code).toBe('internal')
  })
})
