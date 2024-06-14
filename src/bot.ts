import { Telegraf } from 'telegraf'

export default (token: string) => {
    const bot = new Telegraf(token)
    bot.command('semanalonga', (ctx) => ctx.reply('cadê a live?'))
    return bot
}