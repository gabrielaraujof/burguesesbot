import http from 'serverless-http'

import createBot from './bot.js'

const bot = createBot(process.env.BOT_TOKEN ?? '')

console.log('Creating bot', process.env.BOT_TOKEN, process.env.WEBHOOK_SECRET_PATH)

export const handler = (ctx: any) => {
    console.log('Starting', ctx)
}
