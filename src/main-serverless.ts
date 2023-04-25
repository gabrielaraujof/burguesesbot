import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { Telegraf } from 'telegraf';
import { getBotToken } from 'nestjs-telegraf';
import { Handler, Callback, Context } from 'aws-lambda';
import serverlessExpress from '@vendia/serverless-express';

import { AppModule } from './app.module';
import { WebhookSecretPath } from './helper/constants';

let server: Handler;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  const bot = app.get<Telegraf>(getBotToken());

  app.use(await bot.webhookCallback(config.get(WebhookSecretPath)));

  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};
