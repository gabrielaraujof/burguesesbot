import { Logger } from '@nestjs/common';

import { Ctx, Update as Listener, Command } from 'nestjs-telegraf';

import { ContextMessage } from '../../helper/types';
import { ChatService } from '../../ai';

@Listener()
export class Chat {
  private readonly logger = new Logger(Chat.name);

  constructor(private readonly chat: ChatService) {}

  @Command('nyvi')
  async onChattingGPT(@Ctx() ctx: ContextMessage) {
    let replyMessage = '';
    try {
      const data = await this.chat.complete(
        ctx.message.text.replace(/^\/nyvi\s*/g, ''),
        ctx.message.from.first_name,
      );
      replyMessage = data.choices[0].message?.content ?? 'Que? Não entendi';
    } catch (error) {
      this.logger.error(error?.response?.data?.error.message || error?.message);
      if (error.response?.status === 429) {
        replyMessage = 'Tô ocupada agora, não consigo responder.';
      } else {
        replyMessage = 'Eita, deu ruim aqui.';
      }
    } finally {
      await ctx.reply(replyMessage, {
        reply_to_message_id: ctx.message.message_id,
      });
    }
  }
}
