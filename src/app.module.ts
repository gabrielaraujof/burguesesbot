import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { BotModule } from './bot/bot.module';
import { DiscordModule } from './discord/discord.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BotModule,
    DiscordModule,
    AiModule,
  ],
})
export class AppModule {}
