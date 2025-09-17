import { generate } from '../../ai/index.js'
import { getFreeGames } from '../../freegames/index.js'
import { getQuestions } from '../../trivia/index.js'
import { getOnlineMembers } from '../../whosplaying/index.js'
import type { 
  AiService, 
  FreeGamesService, 
  TriviaService, 
  WhosplayingService 
} from '../controllers/events.controllers.js'
import { MockAiService } from '../mocks/ai.mock.js'

export class AiServiceAdapter implements AiService {
  async generate(input: string, systemPrompt: string, history?: any[]): Promise<any> {
    return generate(input, systemPrompt, history)
  }
}

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
    aiService: new AiServiceAdapter(),
    freeGamesService: new FreeGamesServiceAdapter(),
    triviaService: new TriviaServiceAdapter(),
    whosplayingService: new WhosplayingServiceAdapter()
  }
}

export const createDevServiceAdapters = () => {
  return {
    aiService: new MockAiService(),
    freeGamesService: new FreeGamesServiceAdapter(),
    triviaService: new TriviaServiceAdapter(),
    whosplayingService: new WhosplayingServiceAdapter(),
  }
}