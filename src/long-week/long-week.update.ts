import { Context } from 'telegraf';
import { Message, Update as CtxUpdate } from 'typegram';
import { Ctx, On, Update } from 'nestjs-telegraf';

import { LongWeekService } from './long-week.service';

type ContextMessage = Context<CtxUpdate.MessageUpdate<Message.TextMessage>>;

@Update()
export class LongWeekUpdate {
  constructor(private longWeek: LongWeekService) {}

  @On('text')
  async LongWeekReply(@Ctx() ctx: ContextMessage) {
    const {
      message: { text, message_id },
    } = ctx;

    if (this.longWeek.isTriggeredBy(text)) {
      ctx.reply(this.longWeek.reply(), { reply_to_message_id: message_id });
    }
  }
}
