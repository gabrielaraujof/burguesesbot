import { Logger } from '@nestjs/common';

import { Context, Input } from 'telegraf';
import { Ctx, Update, Command, Sender } from 'nestjs-telegraf';
import { FreegamesService } from '../freegames/freegames.service';
import { activeCompareFn } from '../freegames/freegames.helper';

@Update()
export class LongWeekUpdate {
  private readonly logger = new Logger(LongWeekUpdate.name);

  constructor(private readonly epic: FreegamesService) {}

  @Command('semanalonga')
  async LongWeekReply(@Ctx() ctx: Context) {
    this.logger.log('Answering semanalonga command');
    await ctx.reply('cadê a live?');
  }

  @Command('fuck')
  async fuck(
    @Ctx() ctx: Context,
    @Sender('first_name') firstName: string,
    @Sender('last_name') lastName: string,
  ) {
    const prefix = lastName ? `${lastName}, ` : '';
    this.logger.log('Answering fuck command');
    await ctx.replyWithMarkdownV2(`Foda\\-se\\.\n\\- _${prefix}${firstName}_`);
  }

  @Command('freegames')
  async hears(@Ctx() ctx: Context) {
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
