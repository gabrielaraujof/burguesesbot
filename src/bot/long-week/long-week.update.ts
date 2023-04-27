import { Logger } from '@nestjs/common';

import { Context } from 'telegraf';
import { Message, Update as CtxUpdate } from 'typegram';
import { Ctx, Update, Command } from 'nestjs-telegraf';

type ContextMessage = Context<CtxUpdate.MessageUpdate<Message.TextMessage>>;

@Update()
export class LongWeekUpdate {
  private readonly logger = new Logger(LongWeekUpdate.name);

  @Command('semanalonga')
  async LongWeekReply(@Ctx() ctx: ContextMessage) {
    this.logger.log('Answering semanalonga command');
    await ctx.reply('cadê a live?');
  }

  @Command('fuck')
  async fuck(@Ctx() ctx: ContextMessage) {
    const {
      from: { first_name, last_name },
    } = ctx.message;
    const prefix = last_name ? `${last_name}, ` : '';
    this.logger.log('Answering fuck command');
    await ctx.replyWithMarkdownV2(`Foda\\-se\\.\n\\- _${prefix}${first_name}_`);
  }
}
