import { AiError } from '../../ai/index.js'

export type AiErrorCode = 'timeout' | 'unauthorized' | 'rate_limited' | 'blocked' | 'network' | 'internal'

export type AiClassification = { code: AiErrorCode; message: string; retry?: boolean }

export function isTimeout(err: unknown, msgStr: string): boolean {
  return TIMEOUT_RE.test(msgStr) || (err as any)?.name === 'AbortError'
}

export function isUnauthorized(err: unknown, status: unknown, msgStr: string): boolean {
  return status === 401 || status === 403 || UNAUTHORIZED_RE.test(msgStr)
}

export function isRateLimited(err: unknown, status: unknown, msgStr: string): boolean {
  return status === 429 || RATE_RE.test(msgStr)
}

export function isBlocked(err: unknown, msgStr: string): boolean {
  return BLOCKED_RE.test(msgStr)
}

export function isNetwork(err: unknown, msgStr: string): boolean {
  return NETWORK_RE.test(msgStr)
}

export const TIMEOUT_RE = /timed out|Timeout/i
export const UNAUTHORIZED_RE = /unauthorized|forbidden|API key/i
export const RATE_RE = /rate/i
export const BLOCKED_RE = /blocked|safety/i
export const NETWORK_RE = /ENOTFOUND|ECONN|network|fetch failed/i

type ClassifyCtx = { err: unknown; message: string; status: unknown }

const RULES: Array<{
  when: (ctx: ClassifyCtx) => boolean
  result: (ctx: ClassifyCtx) => AiClassification
}> = [
  {
    when: (c) => isTimeout(c.err, c.message),
    result: (c) => ({ code: 'timeout', message: c.message }),
  },
  {
    when: (c) => isUnauthorized(c.err, c.status, c.message),
    result: (c) => ({ code: 'unauthorized', message: c.message }),
  },
  {
    when: (c) => isRateLimited(c.err, c.status, c.message),
    result: (c) => ({ code: 'rate_limited', message: c.message, retry: true }),
  },
  {
    when: (c) => isBlocked(c.err, c.message),
    result: (c) => ({ code: 'blocked', message: c.message }),
  },
  {
    when: (c) => isNetwork(c.err, c.message),
    result: (c) => ({ code: 'network', message: c.message, retry: true }),
  },
]

export function classifyAiError(err: unknown): AiClassification {
  const message = (err as { message?: unknown })?.message
  const msgStr = typeof message === 'string' ? message : 'Unknown AI error'
  const status = (err as { status?: unknown })?.status ?? (err as { code?: unknown })?.code

  const ctx: ClassifyCtx = { err, message: msgStr, status }

  for (const r of RULES) {
    try {
      if (r.when(ctx)) return r.result(ctx)
    } catch {
      // Keep classification robust: ignore rule errors and continue
    }
  }

  return { code: 'internal', message: msgStr }
}

export function toAiError(classification: AiClassification): AiError & { retry?: boolean } {
  const e = new AiError(classification.message, classification.code as any)
  if (classification.retry) return Object.assign(e, { retry: true })
  return e
}

export function normalizeError(err: unknown): AiError & { retry?: boolean } {
  if (err instanceof AiError) return err as AiError & { retry?: boolean }
  const cls = classifyAiError(err)
  return toAiError(cls)
}
