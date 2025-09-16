import { generate } from '../ai/engine.js'
import { getFreeGames } from '../freegames/freegames.service.js'
import { getQuestions } from '../trivia/trivia.service.js'
import { getOnlineMembers } from '../whosplaying/guild.service.js'
import type { 
  AiService, 
  FreeGamesService, 
  TriviaService, 
  WhosplayingService 
} from '../controllers/events.controllers.js'

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