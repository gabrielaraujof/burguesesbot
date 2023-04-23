import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { getBotToken } from 'nestjs-telegraf';

import { AppModule } from './app.module';
import { Port, WebhookSecretPath } from './constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const bot = app.get(getBotToken());
  await bot.webhookCallback(configService.get(WebhookSecretPath));

  await app.listen(configService.get<number>(Port, 3000));
}

bootstrap();
