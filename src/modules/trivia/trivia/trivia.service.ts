import ky from 'ky'

import {
  CategoryId,
  type Difficulty,
  type TriviaResponse,
} from './trivia.interface.js'
import { toQuiz } from './trivia.helper.js'

type GetQuestionsOpts = {
  amount?: number
  difficulty: Difficulty
  category: CategoryId
}

const OpenTriviaDBUrl = process.env.OPEN_TRIVIA_DB_URL ?? ''

export function getQuestions({
  amount = 1,
  difficulty = 'medium',
  category = CategoryId.General,
}: GetQuestionsOpts) {
  console.log(
    `Requesting a ${difficulty} trivia question about category ${category}...`,
  )
  return ky
    .get(OpenTriviaDBUrl, {
      searchParams: {
        amount,
        category,
        difficulty,
        encode: 'base64',
      },
    })
    .then((response) => response.json<TriviaResponse>())
    .then((data) => {
      console.log(`Received ${data.results.length} trivia questions`)
      return data.results
    })
    .then((trivias) => trivias.map(toQuiz))
}
