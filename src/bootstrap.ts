import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Telegraf } from 'telegraf';
import serverlessExpress from '@vendia/serverless-express';
import { Handler } from 'aws-lambda';

import { Port, WebhookDomain, WebhookSecretPath } from './helper/constants';

export async function serverlessBoostrap(
  app: INestApplication,
  config: ConfigService,
  bot: Telegraf,
): Promise<Handler> {
  app.use(
    await bot.createWebhook({
      domain: config.get(WebhookDomain, ''),
      path: config.get(WebhookSecretPath),
    }),
  );

  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export async function serverBootstrap(
  app: INestApplication,
  config: ConfigService,
  bot: Telegraf,
) {
  app.use(await bot.createWebhook({ domain: config.get(WebhookDomain, '') }));

  await app.listen(config.get<number>(Port, 3000));
}
