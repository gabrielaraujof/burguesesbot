export type AiErrorCode =
  | 'timeout'
  | 'rate_limited'
  | 'unauthorized'
  | 'blocked'
  | 'network'
  | 'internal'

export class AiError extends Error {
  code: AiErrorCode
  constructor(message: string, code: AiErrorCode) {
    super(message)
    this.code = code
    this.name = 'AiError'
  }
}
