import type { Callback, Context, Handler } from 'aws-lambda';
import { configure } from '@codegenie/serverless-express';

import createBot from './bot.js';

let proxy: Handler;

async function setup(event: any, context: Context, cb: Callback) {
  const bot = createBot(process.env.BOT_TOKEN ?? '');
  console.log(`Creating bot on ${process.env.WEBHOOK_SECRET_PATH}`);

  const app = bot.webhookCallback(process.env.WEBHOOK_SECRET_PATH);

  proxy = configure({ app });
  return proxy(event, context, cb);
}

function handler(event: any, context: Context, cb: Callback) {
  if (proxy) return proxy(event, context, cb);

  return setup(event, context, cb);
}

export { handler };
