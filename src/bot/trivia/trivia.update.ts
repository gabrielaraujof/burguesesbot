import { Logger } from '@nestjs/common';

import { Command, Ctx, On, Update } from 'nestjs-telegraf';
import { CallbackQuery, Update as Updates } from 'telegraf/types';

import { TriviaService } from './trivia.service';
import {
  categoryMenu,
  difficultyMenu,
  display,
  mainMenu,
} from '../trivia/trivia.helper';
import { Context } from 'telegraf';

@Update()
export class TriviaUpdate {
  private readonly logger = new Logger(TriviaUpdate.name);

  constructor(private readonly trivia: TriviaService) {}

  @Command('trivia')
  async onetime(@Ctx() ctx: Context) {
    this.logger.log('Answering trivia command');
    await ctx.reply(display(), mainMenu());
  }

  @On('callback_query')
  async onCallbackQuery(
    @Ctx() ctx: Context<Updates.CallbackQueryUpdate<CallbackQuery.DataQuery>>,
  ) {
    this.logger.log('Answering callback_query');
    try {
      const data = JSON.parse(ctx.callbackQuery.data);
      this.logger.debug(`Menu: ${data.menu ?? 'main'} | Done: ${!!data.done}`);

      if (data.done) {
        const [quiz] = await this.trivia.getQuestions(data);
        await ctx.deleteMessage(ctx.callbackQuery.message?.message_id);
        await ctx.replyWithQuiz(quiz.title, quiz.options, {
          is_anonymous: false,
          correct_option_id: quiz.correctOptionIndex,
        });
      } else {
        switch (data.menu) {
          case 'category':
            await ctx.editMessageText(display(data), categoryMenu(data));
            break;
          case 'difficulty':
            await ctx.editMessageText(display(data), difficultyMenu(data));
            break;
          default:
            await ctx.editMessageText(display(data), mainMenu(data));
            break;
        }
      }
    } catch (err) {
      this.logger.error(err);
      await ctx.reply('Eita, deu ruim aqui.');
    }
  }
}
