import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { Telegraf } from 'telegraf';
import { getBotToken } from 'nestjs-telegraf';
import { Callback, Context, Handler } from 'aws-lambda';

import { AppModule } from './app.module';
import { Env } from './helper/constants';
import { isProduction } from './helper/functions';
import { serverBootstrap, serverlessBoostrap } from './bootstrap';

let server: Handler;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  const bot = app.get<Telegraf>(getBotToken());

  if (isProduction(config.get(Env, 'development'))) {
    return await serverlessBoostrap(app, config, bot);
  }

  await serverBootstrap(app, config, bot);
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};
