import 'dotenv/config'

import createBot from './bot.js'

console.log(process.env.FREE_GAMES_PROMOTIONS_URL)
const bot = createBot(process.env.BOT_TOKEN ?? '')
bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
