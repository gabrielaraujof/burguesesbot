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

  @Mention('FzoBot')
  async onMention(@Ctx() ctx: ContextMessage) {
    try {
      const message = await this.chatGpt.prompt(ctx.message.text);
      await ctx.reply(message);
    } catch (error) {
      if (error.response.status === 429) {
        await ctx.reply('Tô ocupada agora, não consigo responder.');
      }
    }
  }
}
