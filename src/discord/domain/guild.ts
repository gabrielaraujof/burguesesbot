import { Guild } from 'discord.js';

export const guildRoleByname = (guild: Guild, roleName: string) =>
  guild.roles.cache.find((r) => r.name === roleName);
