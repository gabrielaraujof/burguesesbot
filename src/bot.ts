import { Telegraf } from 'telegraf'

import {
  freegame,
  longweek,
  onCallbackQuery,
  trivia,
  whosplaying,
} from './events.js'
import { maintenance } from './utils.js'

export default (token: string) => {
  const bot = new Telegraf(token)

  bot.command('freegames', freegame)
  bot.command('semanalonga', longweek)
  bot.command('trivia', trivia)

  bot.command('nyvi', maintenance)
  bot.command('whosplaying', whosplaying)

  bot.on('callback_query', onCallbackQuery)

  return bot
}
