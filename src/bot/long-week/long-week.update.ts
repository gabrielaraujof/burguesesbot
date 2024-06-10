import { Logger } from '@nestjs/common';

import { Context, Input } from 'telegraf';
import { Ctx, Update, Command } from 'nestjs-telegraf';
import { FreegamesService } from '../freegames/freegames.service';
import { activeCompareFn } from '../freegames/freegames.helper';
import { TriviaService } from '../trivia/trivia.service';

@Update()
export class LongWeekUpdate {
  private readonly logger = new Logger(LongWeekUpdate.name);

  constructor(
    private readonly trivia: TriviaService,
    private readonly epic: FreegamesService,
  ) {}

  @Command('semanalonga')
  async LongWeekReply(@Ctx() ctx: Context) {
    this.logger.log('Answering semanalonga command');
    await ctx.reply('cadê a live?');
  }

  @Command('trivia')
  async fuck(@Ctx() ctx: Context) {
    this.logger.log('Answering fuck command');
    const [quiz] = await this.trivia.getQuestions();
    this.logger.debug(quiz);
    await ctx.replyWithQuiz(quiz.title, quiz.options, {
      is_anonymous: false,
      correct_option_id: quiz.correctOptionIndex,
    });
  }

  @Command('freegames')
  async hears(@Ctx() ctx: Context) {
    this.logger.log('Answering freegames command');
    const games = await this.epic.getFreeGames();
    games.sort(activeCompareFn);

    await Promise.all(
      games.map((game) => {
        const caption = this.epic.buildPhotoCaption(game);
        if (game.photo) {
          return ctx.replyWithPhoto(Input.fromURL(game.photo), {
            caption,
            parse_mode: 'MarkdownV2',
          });
        } else {
          return ctx.replyWithMarkdownV2(caption);
        }
      }),
    );
  }
}
