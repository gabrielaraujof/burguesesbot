import { Logger } from '@nestjs/common';

import { Ctx, Update, Command, Message, Sender } from 'nestjs-telegraf';

import { ChatService } from '../../ai';
import { Context } from 'telegraf';

@Update()
export class Chat {
  private readonly logger = new Logger(Chat.name);

  constructor(private readonly chat: ChatService) {}

  @Command('nyvi')
  async onChattingGPT(
    @Ctx() ctx: Context,
    @Message('text') text: string,
    @Message('message_id') message_id: number,
    @Sender('first_name') firstName: string,
  ) {
    let replyMessage = '';

    try {
      const data = await this.chat.complete(
        text.replace(/^\/nyvi\s*/g, ''),
        firstName,
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
        reply_parameters: { message_id },
      });
    }
  }
}
