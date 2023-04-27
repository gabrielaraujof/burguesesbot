import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { TelegrafModule } from 'nestjs-telegraf';

import { LongWeekUpdate } from './long-week/long-week.update';
import { BotToken } from '../helper/constants';
import { NotifyService } from './notify/notify.service';
import { NotifyController } from './notify/notify.controller';

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
  ],
  providers: [LongWeekUpdate, NotifyService],
  controllers: [NotifyController],
})
export class BotModule {}
