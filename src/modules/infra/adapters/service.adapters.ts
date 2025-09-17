import { generate, text } from '../../ai/index.js'
import { getFreeGames } from '../../freegames/index.js'
import { getQuestions } from '../../trivia/index.js'
import { getOnlineMembers } from '../../whosplaying/index.js'
import type { 
  AiService, 
  FreeGamesService, 
  TriviaService, 
  WhosplayingService 
} from '../controllers/events.controllers.js'
import { MockAiService, MockAiProvider } from '../mocks/ai.mock.js'
import type { AiProvider, GenerateOptions, ChatMessage, AiResponse } from '../../ai/index.js'
import type { Content } from '@google/generative-ai'

export class AiServiceAdapter implements AiService {
  async generate(input: string, systemPrompt: string, history?: any[]): Promise<any> {
    return generate(input, systemPrompt, history)
  }
}

export class AiProviderAdapter implements AiProvider {
  async generate(input: string, options?: GenerateOptions): Promise<AiResponse> {
    const system = options?.system ?? ''
    const history = options?.history ? mapHistory(options.history) : undefined
    const result = await generate(input, system, history)
    return { text: text(result) }
  }
}

const mapHistory = (history: ChatMessage[]): Content[] => {
  return history
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })) as Content[]
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
    aiProvider: new AiProviderAdapter(),
    freeGamesService: new FreeGamesServiceAdapter(),
    triviaService: new TriviaServiceAdapter(),
    whosplayingService: new WhosplayingServiceAdapter()
  }
}

export const createDevServiceAdapters = () => {
  return {
    aiService: new MockAiService(),
    aiProvider: new MockAiProvider(),
    freeGamesService: new FreeGamesServiceAdapter(),
    triviaService: new TriviaServiceAdapter(),
    whosplayingService: new WhosplayingServiceAdapter(),
  }
}