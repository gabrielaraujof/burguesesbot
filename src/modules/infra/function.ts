import http from 'serverless-http'
import type { Callback, Context, Handler } from 'aws-lambda'

import { createProdBot as createBot } from '../bot/index.js'

let proxy: Handler

function setup() {
  const bot = createBot(process.env.BOT_TOKEN ?? '')
  const app = bot.webhookCallback(process.env.WEBHOOK_SECRET_PATH)
  return http(app)
}

function handler(event: any, context: Context, cb: Callback) {
  if (!proxy) proxy = setup()

  return proxy(event, context, cb)
}

export { handler }
