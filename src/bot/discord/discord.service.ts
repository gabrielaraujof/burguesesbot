import { Logger } from '@nestjs/common';

import { Ctx, Update as Listener, Command } from 'nestjs-telegraf';

import { ContextMessage } from '../../helper/types';
import { GuildProvider } from '../../discord';

@Listener()
export class DiscordService {
  private readonly logger = new Logger(DiscordService.name);

  constructor(private readonly guildProvider: GuildProvider) {}

  @Command('whosplaying')
  async whosplaying(@Ctx() ctx: ContextMessage) {
    this.logger.debug('Command whosplaying activated');

    const members = this.guildProvider.getOnlineMembers();
    const replyMessage = `${members.length} ${
      members.length === 1 ? 'burguês' : 'burgueses'
    } jogando agora. 🎮\n`;
    const onlineMessage = members
      .map(({ name, voiceChannel, game }) => {
        const gameMessage = game ? ` (${game})` : '';
        const channelMessage = voiceChannel
          ? ` - ${voiceChannel.name} ${
              voiceChannel.isStreaming ? '🔴 LIVE' : ''
            }`
          : '';
        return `\n  • ${name}${gameMessage}${channelMessage}`;
      })
      .join('');

    this.logger.debug('Replying command');
    ctx.reply(`${replyMessage}${onlineMessage}`);
  }
}
