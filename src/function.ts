import http from 'serverless-http'

import createBot from './bot.js'

const bot = createBot(process.env.BOT_TOKEN ?? '')

console.log(`Creating bot on ${process.env.WEBHOOK_SECRET_PATH}`)

export const handler = http(bot.webhookCallback(process.env.WEBHOOK_SECRET_PATH))
