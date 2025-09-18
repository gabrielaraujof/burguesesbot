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

  async generate(input: string, systemPrompt: string, history?: any[]): Promise<any> {
    if (this.mockResponses.has(input)) {
      return this.mockResponses.get(input)
    }

    return {
      response: {
        text: () => `Mock AI response for: ${input.substring(0, 50)}...`
      }
    }
  }

  clearMockResponses(): void {
    this.mockResponses.clear()
  }
}

export class MockAiProvider implements AiProvider {
  private mockResponses: Map<string, string> = new Map()

  setMockResponse(input: string, response: string): void {
    this.mockResponses.set(input, response)
  }

  async generate(input: string, options?: GenerateOptions): Promise<AiResponse> {
    if (this.mockResponses.has(input)) {
      return { text: this.mockResponses.get(input)! }
    }
    const system = options?.system || ''
    const historyKey = options?.history
      ?.filter(m => m.role !== 'system')
      .map(m => `${m.role}:${m.content}`)
      .join('|') || ''
    const configKey = options?.config ? JSON.stringify(options.config) : ''
    const composite = [input, system, historyKey, configKey].join('§')
    const hash = crypto.createHash('sha256').update(composite).digest('hex').slice(0, 16)
    return { text: `mock:${hash}` }
  }

  clearMockResponses(): void {
    this.mockResponses.clear()
  }
}