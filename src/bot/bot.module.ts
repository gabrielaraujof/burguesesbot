import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { TelegrafModule } from 'nestjs-telegraf';

import { DiscordModule } from '../discord';
import { LongWeekUpdate } from './long-week/long-week.update';
import { BotToken } from '../helper/constants';
import { NotifyService } from './notify/notify.service';
import { NotifyController } from './notify/notify.controller';
import { Chat } from './chat/chat';
import { DiscordService } from './discord/discord.service';
import { AiModule } from '../ai';
import { FreegamesService } from './freegames/freegames.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
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
    FreegamesService,
  ],
  controllers: [NotifyController],
})
export class BotModule {}
