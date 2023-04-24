import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { getBotToken } from 'nestjs-telegraf';

import { AppModule } from './app.module';
import { Port, WebhookDomain } from './constants';
import { Telegraf } from 'telegraf';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const bot = app.get<Telegraf>(getBotToken());

  app.use(
    await bot.createWebhook({ domain: configService.get(WebhookDomain, '') }),
  );

  await app.listen(configService.get<number>(Port, 3000));
}

bootstrap();
