import type { TriviaProvider, GetQuestionsParams } from './provider.interface.js'
import type { TriviaResponse } from './trivia.interface.js'

export class MockTriviaProvider implements TriviaProvider {
  constructor(private data: TriviaResponse) {}
  async getQuestions(_params: GetQuestionsParams): Promise<TriviaResponse> {
    return this.data
  }
}
