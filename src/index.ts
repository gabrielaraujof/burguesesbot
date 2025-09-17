import 'dotenv/config'

import { createBot, createDevBot } from './modules/bot/index.js'

const useMocks = (process.env.USE_MOCKS ?? 'false').toLowerCase() === 'true'
const bot = (useMocks ? createDevBot : createBot)(process.env.BOT_TOKEN ?? '')
bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
