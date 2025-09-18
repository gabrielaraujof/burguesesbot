import type { CategoryId, Difficulty, TriviaResponse } from './trivia.interface.js'

export type GetQuestionsParams = {
  amount?: number
  difficulty?: Difficulty
  category?: CategoryId
}

export interface TriviaProvider {
  getQuestions(params: GetQuestionsParams): Promise<TriviaResponse>
}
