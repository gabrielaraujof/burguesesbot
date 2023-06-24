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
import { ChatgptService } from './chatgpt/chatgpt.service';
import { DiscordService } from './discord/discord.service';

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
  ],
  providers: [
    LongWeekUpdate,
    NotifyService,
    Chat,
    ChatgptService,
    DiscordService,
  ],
  controllers: [NotifyController],
})
export class BotModule {}
