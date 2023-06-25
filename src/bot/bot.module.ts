import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { TelegrafModule } from 'nestjs-telegraf';
import { GatewayIntentBits } from 'discord.js';

import { DiscordModule } from '../discord';
import { LongWeekUpdate } from './long-week/long-week.update';
import { BotToken, DiscordBotToken } from '../helper/constants';
import { NotifyService } from './notify/notify.service';
import { NotifyController } from './notify/notify.controller';
import { Chat } from './chat/chat';
import { DiscordService } from './discord/discord.service';
import { AiModule } from '../ai';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get(BotToken, ''),
        launchOptions: false,
      }),
      inject: [ConfigService],
    }),
    DiscordModule,
    AiModule,
  ],
  providers: [
    LongWeekUpdate,
    NotifyService,
    Chat,
    DiscordService,
  ],
  controllers: [NotifyController],
})
export class BotModule {}
