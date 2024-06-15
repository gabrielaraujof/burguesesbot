import { Telegraf } from 'telegraf'

import { freegame, longweek } from './commands.js'

export default (token: string) => {
  const bot = new Telegraf(token)

  bot.command('freegames', freegame)
  bot.command('semanalonga', longweek)

  return bot
}
