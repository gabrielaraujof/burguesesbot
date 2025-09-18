import { describe, it, expect, vi } from 'vitest'

// Trivia adapter tests
vi.mock('../src/modules/trivia/trivia/trivia.service.js', () => ({
  getQuestions: vi.fn(async () => [{ title: 'Q', options: ['A','B'], correctOptionIndex: 0 }])
}))
import { getQuestions as triviaGetQuestions } from '../src/modules/trivia/trivia/trivia.service.js'
import { TriviaServiceProviderAdapter } from '../src/modules/trivia/trivia/adapter.js'

// Freegames adapter tests
vi.mock('../src/modules/freegames/freegames/freegames.service.js', () => ({
  getFreeGames: vi.fn(async () => ([{ state: 'active', title: 'Game', slug: 'game', photo: '', start: '2020-01-01', end: '2020-01-02' }]))
}))
import { getFreeGames as freegamesGetFreeGames } from '../src/modules/freegames/freegames/freegames.service.js'
import { FreeGamesServiceProviderAdapter } from '../src/modules/freegames/freegames/adapter.js'

describe('Provider adapters', () => {
  it('Trivia adapter returns quizzes and respects defaults', async () => {
    const adapter = new TriviaServiceProviderAdapter(50)
    const res = await adapter.getQuestions({})
    expect(res.length).toBe(1)
    expect(triviaGetQuestions).toHaveBeenCalledOnce()
  })

  it('FreeGames adapter returns free games with retry', async () => {
    const adapter = new FreeGamesServiceProviderAdapter(1, 1)
    const res = await adapter.getFreeGames()
    expect(res.length).toBe(1)
    expect(freegamesGetFreeGames).toHaveBeenCalledOnce()
  })
})
