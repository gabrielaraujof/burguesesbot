import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { Telegraf } from 'telegraf';
import { getBotToken } from 'nestjs-telegraf';

import { AppModule } from './app.module';
import { NgrokAuthToken, Port } from './helper/constants';

import ngrok from '@ngrok/ngrok';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  const bot = app.get<Telegraf>(getBotToken());
  const listener = await ngrok.connect({
    addr: config.get<number>(Port, 3000),
    authtoken: config.get(NgrokAuthToken),
  });
  const domain = listener.url() ?? '';

  app.use(await bot.createWebhook({ domain }));
  await app.listen(config.get<number>(Port, 3000));
}

bootstrap();
