import { Logger } from '@nestjs/common';

import { Message, Update as CtxUpdate } from 'typegram';
import { Ctx, Mention, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { ChatgptService } from '../chatgpt/chatgpt.service';

type ContextMessage = Context<CtxUpdate.MessageUpdate<Message.TextMessage>>;

@Update()
export class Chat {
  private readonly logger = new Logger(Chat.name);

  constructor(private chatGpt: ChatgptService) {}

  @Mention('burguesesbot')
  async onMention(@Ctx() ctx: ContextMessage) {
    let replyMessage = 'Não entendi';
    try {
      replyMessage = await this.chatGpt.prompt(
        ctx.message.text.replace(/@burguesesbot/g, ''),
      );
    } catch (error) {
      if (error.response?.status === 429) {
        replyMessage = 'Tô ocupada agora, não consigo responder.';
      } else {
        this.logger.error(error);
        replyMessage = 'Eita, deu ruim aqui.';
      }
    } finally {
      await ctx.reply(replyMessage, {
        reply_to_message_id: ctx.message.message_id,
      });
    }
  }
}
