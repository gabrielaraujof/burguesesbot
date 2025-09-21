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
import { getPersonaForCommand } from '../../ai/index.js'
import { withTyping, safeTruncate, TELEGRAM_QUIZ_EXPLANATION_MAX_CHARS } from '../utils.js'
import { buildTriviaJsonInstruction, safeParseTriviaExplanation } from '../../ai/structured.js'
import { renderLongweekPrompt, renderTriviaExplanationPrompt } from '../../ai/prompts.js'

export const createLongweekController = (deps: { aiProvider: AiProvider }) => {
  return async (ctx: Context) => {
    if (process.env.NODE_ENV !== 'test') console.info('Answering semanalonga')
    try {
      let response = ''
      await withTyping(ctx, async () => {
  const rendered = await renderLongweekPrompt()
        const opts = { system: rendered.system, config: { temperature: 0.8, maxTokens: 120 } as const }
        if (deps.aiProvider.generateStream) {
          for await (const chunk of deps.aiProvider.generateStream(rendered.input, opts)) {
            response += chunk
          }
        } else {
          const { text } = await deps.aiProvider.generate(rendered.input, opts)
          response = text
        }
      })

      if (!response || response.trim().length === 0) response = 'cadê a live? 🎮 Time to relax!'
      await ctx.reply(response.trim())
    } catch (err) {
      console.error('Longweek AI error:', err)
      
      await ctx.reply('cadê a live?')
    }
  }
}

export const createFreegameController = (deps: { freeGamesService: FreeGamesService }) => {
  return async (ctx: Context) => {
    if (process.env.NODE_ENV !== 'test') console.info('Answering freegames command')
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
      let message = ''
      await withTyping(ctx, async () => {
        const res = await deps.aiProvider.generate(
          JSON.stringify(members),
          { system: getPersonaForCommand('whosplaying'), history: whosplayingHistory },
        )
        message = res.text
      })
      await ctx.reply(message)
    } catch (err) {
      console.error(err)
    }
  }
}

export const createTriviaController = () => {
  return async (ctx: Context) => {
    if (process.env.NODE_ENV !== 'test') console.info('Answering trivia command')
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
        if (process.env.NODE_ENV !== 'test') console.debug(`Menu: ${data.menu ?? 'main'} | Done: ${!!data.done}`)

        if (data.done) {
          const [quiz] = await deps.triviaService.getQuestions(data)
          let explanation
          try {
            let text
            await withTyping(ctx, async () => {
              const rendered = await renderTriviaExplanationPrompt({
                quizInput: buildGnerationInput(quiz),
                formatInstructions: buildTriviaJsonInstruction(),
              })
              const { text: t } = await deps.aiProvider.generate(rendered.input, { system: rendered.system })
              text = t
            })
            const parsed = text ? safeParseTriviaExplanation(text) : null
            explanation = parsed
              ? `${parsed.explanation}${parsed.fun_fact ? `\n\nCuriosidade: ${parsed.fun_fact}` : ''}`
              : text
          } catch (err) {
            console.error('trivia explanation error')
            explanation = undefined
          }
          await ctx.deleteMessage(ctx.callbackQuery.message?.message_id)
          const safeExplanation = explanation ? safeTruncate(explanation, TELEGRAM_QUIZ_EXPLANATION_MAX_CHARS) : explanation
          await ctx.replyWithQuiz(quiz.title, quiz.options, {
            is_anonymous: false,
            correct_option_id: quiz.correctOptionIndex,
            explanation: safeExplanation,
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
        console.error('callback_query error')
      }
    }
  }
}

export const createControllers = (dependencies: ControllerDependencies) => {
  return {
    longweek: createLongweekController({ aiProvider: dependencies.aiProvider }),
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