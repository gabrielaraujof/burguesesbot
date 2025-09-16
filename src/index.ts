import 'dotenv/config'

import { createBot } from './modules/bot/index.js'

const bot = createBot(process.env.BOT_TOKEN ?? '')
bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
