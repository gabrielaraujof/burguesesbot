import { Telegraf } from 'telegraf'

export default (token: string) => {
    console.log('Starting bot')
    const bot = new Telegraf(token)
    bot.command('semanalonga', async (ctx) => {
        console.log('Answering semanalonga')
        await ctx.reply('cadê a live?')
    })
    return bot
}