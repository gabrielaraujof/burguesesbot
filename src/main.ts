import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { Telegraf } from 'telegraf';
import { getBotToken } from 'nestjs-telegraf';

import { AppModule } from './app.module';
import { Port, WebhookDomain } from './helper/constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  const bot = app.get<Telegraf>(getBotToken());

  app.use(await bot.createWebhook({ domain: config.get(WebhookDomain, '') }));

  await app.listen(config.get<number>(Port, 3000));
}

bootstrap();
