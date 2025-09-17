import type { AiService } from '../controllers/events.controllers.js'
import type { AiProvider, AiResponse, GenerateOptions } from '../../ai/index.js'

export class MockAiService implements AiService {
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

  async generate(input: string, _options?: GenerateOptions): Promise<AiResponse> {
    if (this.mockResponses.has(input)) {
      return { text: this.mockResponses.get(input)! }
    }
    return { text: `Mock AI response for: ${input.substring(0, 50)}...` }
  }

  clearMockResponses(): void {
    this.mockResponses.clear()
  }
}