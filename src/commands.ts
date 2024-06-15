import { Input, type Context } from 'telegraf'

import {
  buildPhotoCaption,
  getFreeGames,
} from './freegames/freegames.service.js'
import { activeCompareFn } from './freegames/freegames.helper.js'

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
      const caption = buildPhotoCaption(game)
      if (game.photo) {
        return ctx.replyWithPhoto(Input.fromURL(game.photo), {
          caption,
          parse_mode: 'MarkdownV2',
        })
      } else {
        return ctx.replyWithMarkdownV2(caption)
      }
    }),
  )
}
