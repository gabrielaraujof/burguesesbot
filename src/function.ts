import http from 'serverless-http';

import createBot from './bot.js';

const bot = createBot(process.env.BOT_TOKEN ?? '');

export const handler = http(bot.webhookCallback(process.env.WEBHOOK_SECRET_PATH));
