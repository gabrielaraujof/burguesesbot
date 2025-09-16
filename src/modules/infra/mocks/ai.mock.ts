import type { AiService } from '../controllers/events.controllers.js'

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