import { Injectable } from '@nestjs/common';

import { Context, Telegraf } from 'telegraf';
import { InjectBot } from 'nestjs-telegraf';

@Injectable()
export class NotifyService {
  constructor(@InjectBot() private bot: Telegraf<Context>) {}

  async notify(chatId: string, message: string) {
    await this.bot.telegram.sendMessage(chatId, message);
  }
}
