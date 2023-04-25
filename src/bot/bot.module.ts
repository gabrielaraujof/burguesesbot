import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { TelegrafModule } from 'nestjs-telegraf';

import { BotToken } from '../helper/constants';
import { LongWeekModule } from '../long-week/long-week.module';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get(BotToken, ''),
        launchOptions: false
      }),
      inject: [ConfigService],
    }),
    LongWeekModule,
  ],
})
export class BotModule {}
