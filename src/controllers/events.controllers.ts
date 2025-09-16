import { Input, type Context } from 'telegraf'
import type { Update } from 'telegraf/types'

export interface AiService {
  generate(input: string, systemPrompt: string, history?: any[]): Promise<any>
}

export interface FreeGamesService {
  getFreeGames(): Promise<any[]>
}

export interface TriviaService {
  getQuestions(options: any): Promise<any[]>
}

export interface WhosplayingService {
  getOnlineMembers(): Promise<any[]>
}

export interface ControllerDependencies {
  aiService: AiService
  freeGamesService: FreeGamesService
  triviaService: TriviaService
  whosplayingService: WhosplayingService
}

import { activeCompareFn, gameCard } from '../freegames/freegames.helper.js'
import {
  buildGnerationInput,
  categoryMenu,
  difficultyMenu,
  display,
  mainMenu,
} from '../trivia/trivia.helper.js'
import { triviaExpert, whosplayingExpert } from '../ai/system.prompt.js'
import { text } from '../ai/output.js'
import { whosplayingHistory } from '../ai/history.js'

export const createLongweekController = () => {
  return async (ctx: Context) => {
    console.log('Answering semanalonga')
    await ctx.reply('cadê a live?')
  }
}

export const createFreegameController = (deps: { freeGamesService: FreeGamesService }) => {
  return async (ctx: Context) => {
    console.log('Answering freegames command')
    const games = await deps.freeGamesService.getFreeGames()
    games.sort(activeCompareFn)

    await Promise.all(
      games.map((game) => {
        const { caption, keyboard } = gameCard(game)
        if (game.photo) {
          return ctx.replyWithPhoto(Input.fromURL(game.photo), {
            ...keyboard,
            caption,
          })
        } else {
          return ctx.reply(caption, keyboard)
        }
      }),
    )
  }
}

export const createWhosplayingController = (deps: { 
  aiService: AiService
  whosplayingService: WhosplayingService 
}) => {
  return async (ctx: Context) => {
    try {
      const members = await deps.whosplayingService.getOnlineMembers()
      const generatedMessage = await deps.aiService.generate(
        JSON.stringify(members),
        whosplayingExpert,
        whosplayingHistory,
      )
      const message = text(generatedMessage)
      await ctx.reply(message)
    } catch (err) {
      console.error(err)
    }
  }
}

export const createTriviaController = () => {
  return async (ctx: Context) => {
    console.log('Answering trivia command')
    await ctx.reply(display(), mainMenu())
  }
}

export const createCallbackQueryController = (deps: {
  aiService: AiService
  triviaService: TriviaService
}) => {
  return async (ctx: Context<Update.CallbackQueryUpdate>) => {
    if ('data' in ctx.callbackQuery) {
      console.log('Answering data callback_query')
      try {
        const data = JSON.parse(ctx.callbackQuery.data)
        console.debug(`Menu: ${data.menu ?? 'main'} | Done: ${!!data.done}`)

        if (data.done) {
          const [quiz] = await deps.triviaService.getQuestions(data)
          let explanation
          try {
            const generatedExplanation = await deps.aiService.generate(
              buildGnerationInput(quiz),
              triviaExpert,
            )
            explanation = text(generatedExplanation)
          } catch (err) {
            console.error(err)
            explanation = undefined
          }
          await ctx.deleteMessage(ctx.callbackQuery.message?.message_id)
          await ctx.replyWithQuiz(quiz.title, quiz.options, {
            is_anonymous: false,
            correct_option_id: quiz.correctOptionIndex,
            explanation,
          })
        } else {
          switch (data.menu) {
            case 'category':
              await ctx.editMessageText(display(data), categoryMenu(data))
              break
            case 'difficulty':
              await ctx.editMessageText(display(data), difficultyMenu(data))
              break
            default:
              await ctx.editMessageText(display(data), mainMenu(data))
              break
          }
        }
      } catch (err) {
        console.error(err)
      }
    }
  }
}

export const createControllers = (dependencies: ControllerDependencies) => {
  return {
    longweek: createLongweekController(),
    freegame: createFreegameController({ freeGamesService: dependencies.freeGamesService }),
    whosplaying: createWhosplayingController({ 
      aiService: dependencies.aiService,
      whosplayingService: dependencies.whosplayingService 
    }),
    trivia: createTriviaController(),
    onCallbackQuery: createCallbackQueryController({
      aiService: dependencies.aiService,
      triviaService: dependencies.triviaService
    })
  }
}