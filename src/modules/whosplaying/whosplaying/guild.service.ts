import { Client, Events } from 'discord.js'
import {
  getRoleByName,
  hasRole,
  isOnline,
  isPlaying,
  toMemberLite,
} from './guild.helper.js'
import type { MemberLite } from './guild.interface.js'

const GuildId = process.env.DISCORD_GUILD_ID ?? ''
const Token = process.env.DISCORD_BOT_TOKEN ?? ''

console.log(`Recreating client`)
const client = new Client({
  intents: ['Guilds', 'GuildMembers', 'GuildPresences'],
})

export async function getOnlineMembers(): Promise<MemberLite[]> {
  if (!client.isReady()) {
    console.log('Client is not ready yet. Loggin in...')
    await client.login(Token)
    await new Promise((resolve, reject) => {
      client.once(Events.ClientReady, () => {
        console.log('Client is ready')
        resolve(undefined)
      })
    })
  }

  try {
    const guild = await client.guilds.fetch(GuildId)
    const role = getRoleByName(guild, 'Burguês')
    const members = await guild.members.fetch()
    const onlineMembers = members.filter(
      (member) =>
        hasRole(role)(member) && isOnline(member) && isPlaying(member),
    )
    return onlineMembers.map(toMemberLite)
  } catch (error) {
    console.error('Error fetching channel or sending message:', error)
    throw error
  }
}
