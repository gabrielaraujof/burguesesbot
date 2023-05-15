import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Ctx, Update as Listener, Command } from 'nestjs-telegraf';

import { ActivityType, Client, PresenceUpdateStatus } from 'discord.js';
import { InjectDiscordClient } from '@discord-nestjs/core';

import { ContextMessage } from '../../helper/types';
import { DiscordGuildId } from '../../helper/constants';

@Listener()
export class DiscordService {
  private readonly logger = new Logger(DiscordService.name);

  constructor(
    private config: ConfigService,
    @InjectDiscordClient()
    private readonly client: Client,
  ) {}

  @Command('whosplaying')
  async whosplaying(@Ctx() ctx: ContextMessage) {
    const onlineMembers = await this.getOnlineMembersWithGame();
    const replyMessage = `${onlineMembers.size} ${
      onlineMembers.size === 1 ? 'burguês' : 'burgueses'
    } jogando agora. 🎮\n`;
    const onlineMessage = onlineMembers
      .map((member) => {
        const game = member.presence?.activities[0];
        return `\n  • ${member.displayName}${game ? ` (${game?.name})` : ''}`;
      })
      .join('');

    ctx.reply(`${replyMessage}${onlineMessage}`);
  }

  private async getOnlineMembersWithGame() {
    const guildId = this.config.get(DiscordGuildId, '');
    const guild = this.client.guilds.cache.get(guildId);
    if (!guild) {
      throw new Error('Invalid guild ID');
    }

    const role = guild.roles.cache.find((r) => r.name === 'Burguês');
    if (!role) {
      throw new Error('Invalid role name');
    }

    const onlineMembers = guild.members.cache.filter(
      (member) => member.presence?.status === PresenceUpdateStatus.Online,
    );

    const onlineMembersWithGame = onlineMembers.filter((member) => {
      const activities = member.presence?.activities;
      if (!activities?.length) return false;

      const playingGames = activities.filter(
        (activity) => activity.type === ActivityType.Playing,
      );
      if (!playingGames.length) return false;

      const hasRole = member.roles.cache.has(role.id);
      return hasRole;
    });

    return onlineMembersWithGame;
  }
}
