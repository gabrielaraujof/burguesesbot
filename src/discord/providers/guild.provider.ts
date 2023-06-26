import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Client } from 'discord.js';
import { InjectDiscordClient } from '@discord-nestjs/core';

import { DiscordGuildId } from '../../helper/constants';
import {
  isMemberPlaying,
  isMemberOnline,
  memberHasRole,
  toMemberDto,
} from '../domain/member';
import { guildRoleByname } from '../domain/guild';

@Injectable()
export class GuildProvider {
  private readonly logger = new Logger(GuildProvider.name);
  private readonly guildID: string;

  constructor(
    private config: ConfigService,
    @InjectDiscordClient()
    private readonly client: Client,
  ) {
    this.guildID = this.config.get(DiscordGuildId, '');
  }

  getOnlineMembers() {
    const guild = this.getGuild(this.guildID);
    const role = guildRoleByname(guild, 'Burguês');

    this.logger.debug('Getting online discord members...');
    return guild.members.cache
      .filter(memberHasRole(role))
      .filter(isMemberOnline)
      .filter(isMemberPlaying)
      .map(toMemberDto);
  }

  private getGuild(guildId: string) {
    const guild = this.client.guilds.cache.get(guildId);
    if (!guild) {
      throw new Error('Invalid guild ID');
    }
    return guild;
  }
}
