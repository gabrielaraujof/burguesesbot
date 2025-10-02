import type { TriviaProvider, GetQuestionsParams } from './provider.interface.js'
import { CategoryId } from './trivia.interface.js'
import { getQuestions as fetchQuestions } from './trivia.service.js'

export class TriviaServiceProviderAdapter implements TriviaProvider {
  constructor(private readonly timeoutMs = parseInt(process.env.TRIVIA_TIMEOUT_MS || '8000')) {}
  async getQuestions(params: GetQuestionsParams = {}): Promise<any[]> {
    const p = fetchQuestions({
      amount: params.amount ?? 1,
      difficulty: params.difficulty ?? 'medium',
      category: params.category ?? CategoryId.General,
    })
    return await this.callWithTimeout(p)
  }

  private async callWithTimeout<T>(p: Promise<T>): Promise<T> {
    let handle: any
    const t = new Promise<never>((_, rej) => {
      handle = setTimeout(() => rej(new Error('trivia timeout')), this.timeoutMs)
    })
    try {
      return (await Promise.race([p, t])) as T
    } finally {
      clearTimeout(handle)
    }
  }
}
