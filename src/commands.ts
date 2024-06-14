import type { Context } from 'telegraf'

export const longweek = async (ctx: Context) => {
  console.log('Answering semanalonga')
  await ctx.reply('cadê a live?')
}
