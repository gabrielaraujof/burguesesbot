import { Message, Update } from 'typegram';
import { Context } from 'telegraf';

export type ContextMessage = Context<Update.MessageUpdate<Message.TextMessage>>;
