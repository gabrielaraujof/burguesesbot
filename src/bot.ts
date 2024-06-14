import { Telegraf } from 'telegraf'

import { longweek } from './commands.js'

export default (token: string) => {
  const bot = new Telegraf(token)
  
  bot.command('semanalonga', longweek)
  
  return bot
}
