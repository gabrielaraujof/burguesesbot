import { Activity, ActivityType, Guild, GuildMember, Role } from 'discord.js'
import type { ActivityLite, MemberLite } from './guild.interface.js'

const toActivityLite = ({
  name,
  details,
  state,
  party,
}: Activity): ActivityLite => ({
  name,
  details,
  state,
  party: party?.size
    ? {
        size: party.size[0],
      }
    : null,
})

export const toMemberLite = ({
  presence,
  displayName,
}: GuildMember): MemberLite => ({
  displayName,
  activities: presence?.activities?.map(toActivityLite) ?? [],
})

export const isPlaying = ({ presence }: GuildMember) =>
  !!presence?.activities?.some(({ type }) => type === ActivityType.Playing)

export const isOnline = ({ presence }: GuildMember) =>
  presence?.status === 'online'

export const hasRole =
  ({ id }: Role = {} as Role) =>
  ({ roles }: GuildMember) =>
    !!id && roles.cache.has(id)

export const getRoleByName = (guild: Guild, roleName: string) =>
  guild.roles.cache.find(({ name }) => name === roleName)
