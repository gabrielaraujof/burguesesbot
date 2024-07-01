import { Input, type Context } from 'telegraf'
import type { Update } from 'telegraf/types'

import { getFreeGames } from './freegames/freegames.service.js'
import { activeCompareFn, gameCard } from './freegames/freegames.helper.js'

import {
  buildGnerationInput,
  categoryMenu,
  difficultyMenu,
  display,
  mainMenu,
} from './trivia/trivia.helper.js'
import { getQuestions } from './trivia/trivia.service.js'
import './ai/engine.js'
import { generate } from './ai/engine.js'
import { triviaExpert } from './ai/system.prompt.js'
import { text } from './ai/output.js'

export const longweek = async (ctx: Context) => {
  console.log('Answering semanalonga')
  await ctx.reply('cadê a live?')
}

export const freegame = async (ctx: Context) => {
  console.log('Answering freegames command')
  const games = await getFreeGames()
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

export const trivia = async (ctx: Context) => {
  console.log('Answering trivia command')
  await ctx.reply(display(), mainMenu())
}

export const onCallbackQuery = async (
  ctx: Context<Update.CallbackQueryUpdate>,
) => {
  if ('data' in ctx.callbackQuery) {
    console.log('Answering data callback_query')
    try {
      const data = JSON.parse(ctx.callbackQuery.data)
      console.debug(`Menu: ${data.menu ?? 'main'} | Done: ${!!data.done}`)

      if (data.done) {
        const [quiz] = await getQuestions(data)
        let explanation
        try {
          const generatedExplanation = await generate(
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
          explanation
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
