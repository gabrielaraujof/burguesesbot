import type { AiProvider, AiResponse, GenerateOptions } from '../../ai/index.js'
import crypto from 'node:crypto'

export class MockAiProvider implements AiProvider {
  private mockResponses: Map<string, string> = new Map()

  private stableSerialize(value: any): string {
    if (value === null || typeof value !== 'object')
      return JSON.stringify(value)
    if (Array.isArray(value))
      return '[' + value.map((v) => this.stableSerialize(v)).join(',') + ']'
    const keys = Object.keys(value).sort()
    return (
      '{' +
      keys
        .map((k) => JSON.stringify(k) + ':' + this.stableSerialize(value[k]))
        .join(',') +
      '}'
    )
  }

  setMockResponse(input: string, response: string): void {
    this.mockResponses.set(input, response)
  }

  private buildHistoryKey(history?: any[]): string {
    if (!history || history.length === 0) return ''
    return (
      history
        .filter(this.isRoleContentMsg)
        .filter((m) => m.role !== 'system')
        .map((m) => `${m.role}:${m.content}`)
        .join('|') || ''
    )
  }

  private isRoleContentMsg(m: any): m is { role: string; content: string } {
    return m && typeof m.role === 'string' && typeof m.content === 'string'
  }

  async generate(
    input: string,
    options?: GenerateOptions,
  ): Promise<AiResponse> {
    if (this.mockResponses.has(input)) {
      return { text: this.mockResponses.get(input)! }
    }
    const system = options?.system || ''
    const historyKey = this.buildHistoryKey(options?.history)
    const configKey = options?.config
      ? this.stableSerialize(options.config)
      : ''
    const composite = this.stableSerialize({
      input,
      system,
      history: historyKey,
      config: configKey,
    })
    const hash = crypto
      .createHash('sha256')
      .update(composite)
      .digest('hex')
      .slice(0, 16)
    return { text: `mock:${hash}` }
  }

  async *generateStream(
    input: string,
    options?: GenerateOptions,
  ): AsyncIterable<string> {
    if (this.mockResponses.has(input)) {
      const response = this.mockResponses.get(input)!
      const words = response.split(' ')
      for (let i = 0; i < words.length; i++) {
        if (i === words.length - 1) {
          yield words[i]
        } else {
          yield words[i] + ' '
        }
      }
      return
    }

    const { text } = await this.generate(input, options)
    yield text
  }

  clearMockResponses(): void {
    this.mockResponses.clear()
  }
}
