import { GuildMember, PresenceUpdateStatus, Role } from 'discord.js';
import { isPlaying } from './activity';
type VoiceChannelDto = {
  name: string;
  isStreaming: boolean;
};

type MemberDto = {
  name: string;
  voiceChannel: VoiceChannelDto | null;
  game?: string;
};

export const isMemberOnline = (member: GuildMember) =>
  member.presence?.status === PresenceUpdateStatus.Online;

export const isMemberPlaying = (member: GuildMember) =>
  member.presence?.activities?.some(isPlaying) ?? false;

export const memberHasRole = (role?: Role) => (member: GuildMember) =>
  role ? member.roles.cache.has(role.id) : true;

export const toMemberDto = (member: GuildMember): MemberDto => {
  const channel = member.voice.channel;
  return {
    name: member.displayName,
    voiceChannel: channel
      ? {
          name: channel.name,
          isStreaming: member.voice.streaming ?? false,
        }
      : null,
    game: member.presence?.activities?.find(isPlaying)?.name,
  };
};
