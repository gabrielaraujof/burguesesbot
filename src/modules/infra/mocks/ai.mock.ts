import type { AiProvider, AiResponse, GenerateOptions } from '../../ai/index.js'
import crypto from 'node:crypto'

// Legacy mock retained until AiService removal (#58)
export interface AiServiceLegacy {
  generate(input: string, systemPrompt: string, history?: any[]): Promise<any>
  setMockResponse(input: string, response: any): void
  clearMockResponses(): void
}

export class MockAiService implements AiServiceLegacy {
  private mockResponses: Map<string, any> = new Map()

  setMockResponse(input: string, response: any): void {
    this.mockResponses.set(input, response)
  }

  async generate(
    input: string,
    systemPrompt: string,
    history?: any[],
  ): Promise<any> {
    if (this.mockResponses.has(input)) {
      return this.mockResponses.get(input)
    }

    return {
      response: {
        text: () => `Mock AI response for: ${input.substring(0, 50)}...`,
      },
    }
  }

  clearMockResponses(): void {
    this.mockResponses.clear()
  }
}

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

  clearMockResponses(): void {
    this.mockResponses.clear()
  }
}
