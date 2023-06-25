import { Logger } from '@nestjs/common';

import { Ctx, Update as Listener, Command } from 'nestjs-telegraf';

import { ChatgptService } from '../chatgpt/chatgpt.service';
import { ContextMessage } from '../../helper/types';

@Listener()
export class Chat {
  private readonly logger = new Logger(Chat.name);

  constructor(private chatGpt: ChatgptService) {}

  @Command('nyvi')
  async onChattingGPT(@Ctx() ctx: ContextMessage) {
    let replyMessage = 'Não entendi';
    try {
      replyMessage = await this.chatGpt.prompt(
        ctx.message.text.replace(/^\/nyvi\s*/g, ''),
        ctx.message.from.first_name,
      );
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
