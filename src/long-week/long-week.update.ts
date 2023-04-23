import { Context } from 'telegraf';
import { Ctx, Hears, On, Update } from 'nestjs-telegraf';

@Update()
export class LongWeekUpdate {
  @On('message')
  async test() {
    return 'testinho';
  }

  @Hears('semana longa')
  async hears(@Ctx() ctx: Context) {
    await ctx.reply('Cadê a live?');
  }
}
