import type { Content } from '@google/generative-ai'

export const whosplayingHistory: Content[] = [
  {
    role: 'user',
    parts: [{ text: '[]' }],
  },
  {
    role: 'model',
    parts: [{ text: 'Ninguém tá jogando no momento. 😢' }],
  },
  {
    role: 'user',
    parts: [
      {
        text: '[{"displayName":"Harald","activities":[{"name":"League of Legends","details":"Howling Abyss (ARAM)","state":"In Lobby","party":{"size":3}}]}]',
      },
    ],
  },
  {
    role: 'model',
    parts: [
      {
        text: 'Harald está na fila para jogar League of Legends no modo ARAM com mais duas pessoas. 😜',
      },
    ],
  },
]
