import { Logger } from '@nestjs/common';

import { Context } from 'telegraf';
import { Message, Update as CtxUpdate } from 'typegram';
import { Ctx, On, Update, Command, Hears } from 'nestjs-telegraf';

import { LongWeekService } from './long-week.service';

type ContextMessage = Context<CtxUpdate.MessageUpdate<Message.TextMessage>>;

@Update()
export class LongWeekUpdate {
  private readonly logger = new Logger(LongWeekUpdate.name);

  constructor(private longWeek: LongWeekService) {}

  @Command('semanalonga')
  async LongWeekReply(@Ctx() ctx: ContextMessage) {
    await ctx.reply(this.longWeek.reply());
  }

  @Command('fuck')
  async fuck(@Ctx() ctx: ContextMessage) {
    const { from: { first_name, last_name } } = ctx.message;
    const prefix = last_name ? `${last_name}, ` : '';
    await ctx.replyWithMarkdownV2(`Foda\\-se\\.\n\\- _${prefix}${first_name}_`);
  }
}
