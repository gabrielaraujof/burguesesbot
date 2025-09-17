import { Input, type Context } from 'telegraf'
import type { Update } from 'telegraf/types'

import type { AiProvider } from '../../ai/index.js'

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
  aiProvider: AiProvider
  freeGamesService: FreeGamesService
  triviaService: TriviaService
  whosplayingService: WhosplayingService
}

import { activeCompareFn, gameCard } from '../../freegames/index.js'
import {
  buildGnerationInput,
  categoryMenu,
  difficultyMenu,
  display,
  mainMenu,
} from '../../trivia/index.js'
import { triviaExpert, whosplayingExpert } from '../../ai/index.js'
import { whosplayingHistory } from '../../ai/index.js'

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
  aiProvider: AiProvider
  whosplayingService: WhosplayingService 
}) => {
  return async (ctx: Context) => {
    try {
      const members = await deps.whosplayingService.getOnlineMembers()
      const { text: message } = await deps.aiProvider.generate(
        JSON.stringify(members),
        { system: whosplayingExpert, history: whosplayingHistory },
      )
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
  aiProvider: AiProvider
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
            const { text } = await deps.aiProvider.generate(
              buildGnerationInput(quiz),
              { system: triviaExpert },
            )
            explanation = text
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
      aiProvider: dependencies.aiProvider,
      whosplayingService: dependencies.whosplayingService 
    }),
    trivia: createTriviaController(),
    onCallbackQuery: createCallbackQueryController({
      aiProvider: dependencies.aiProvider,
      triviaService: dependencies.triviaService
    })
  }
}