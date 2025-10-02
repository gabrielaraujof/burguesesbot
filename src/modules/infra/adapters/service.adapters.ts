import { text } from '../../ai/index.js'
import { getFreeGames } from '../../freegames/index.js'
import { getQuestions } from '../../trivia/index.js'
import { getOnlineMembers } from '../../whosplaying/index.js'
import type {
  FreeGamesService,
  TriviaService,
  WhosplayingService,
} from '../controllers/events.controllers.js'
import { MockAiProvider } from '../mocks/ai.mock.js'
import type { AiProvider, GenerateOptions, AiResponse } from '../../ai/index.js'
import { AiError } from '../../ai/index.js'

import { LangChainGenAiProviderAdapter } from './langchain.adapter.js'

export class FreeGamesServiceAdapter implements FreeGamesService {
  async getFreeGames(): Promise<any[]> {
    return getFreeGames()
  }
}

export class TriviaServiceAdapter implements TriviaService {
  async getQuestions(options: any): Promise<any[]> {
    return getQuestions(options)
  }
}

export class WhosplayingServiceAdapter implements WhosplayingService {
  async getOnlineMembers(): Promise<any[]> {
    return getOnlineMembers()
  }
}

export const createServiceAdapters = () => {
  return {
    aiProvider: new LangChainGenAiProviderAdapter(),
    freeGamesService: new FreeGamesServiceAdapter(),
    triviaService: new TriviaServiceAdapter(),
    whosplayingService: new WhosplayingServiceAdapter(),
  }
}

export const createDevServiceAdapters = () => {
  return {
    aiProvider: new MockAiProvider(),
    freeGamesService: new FreeGamesServiceAdapter(),
    triviaService: new TriviaServiceAdapter(),
    whosplayingService: new WhosplayingServiceAdapter(),
  }
}
