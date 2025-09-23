import type { TriviaProvider, GetQuestionsParams } from './provider.interface.js'
import type { TriviaResponse, Quiz } from './trivia.interface.js'

export class MockTriviaProvider implements TriviaProvider {
  constructor(private data: TriviaResponse) {}
  // Convert stored TriviaResponse into the Quiz[] shape expected by the interface
  async getQuestions(_params: GetQuestionsParams): Promise<Quiz[]> {
    const results = this.data?.results ?? []
    return results.map((r) => ({
      title: r.question,
      options: [r.correct_answer, ...r.incorrect_answers],
      correctOptionIndex: 0,
    }))
  }
}
