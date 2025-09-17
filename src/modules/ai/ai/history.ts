import type { ChatMessage } from './provider.interface.js'

export const whosplayingHistory: ChatMessage[] = [
  { role: 'user', content: '[]' },
  { role: 'assistant', content: 'Ninguém tá jogando no momento. 😢' },
  {
    role: 'user',
    content:
      '[{"displayName":"Harald","activities":[{"name":"League of Legends","details":"Howling Abyss (ARAM)","state":"In Lobby","party":{"size":3}}]}]',
  },
  {
    role: 'assistant',
    content:
      'Harald está na fila para jogar League of Legends no modo ARAM com mais duas pessoas. 😜',
  },
]
