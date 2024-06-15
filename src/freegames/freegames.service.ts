import ky from 'ky'

import type {
  FreeGame,
  FreeGamesPromotionsResponse,
} from './freegames.interface.js'
import { formatDate, freeGameOnly } from './freegames.helper.js'

const ProductStoreUrl = process.env.PRODUCT_STORE_URL ?? ''
const FREE_GAMES_PROMOTIONS_URL = process.env.FREE_GAMES_PROMOTIONS_URL ?? ''

export function getFreeGames() {
  console.log('Getting free games promotions')

  return ky
    .get(FREE_GAMES_PROMOTIONS_URL)
    .then((response) => response.json<FreeGamesPromotionsResponse>())
    .then(({ data }) => data.Catalog.searchStore.elements)
    .then(freeGameOnly)
}

export function buildPhotoCaption(game: FreeGame): string {
  const startDate = formatDate(game.start)
  const endDate = formatDate(game.end)
  return [
    `[*${game.title}*\](${ProductStoreUrl}/${game.slug})`,
    game.state === 'active' ? `🟢 *JÁ DISPONÍVEL* 🟢` : 'EM BREVE',
    `_${game.state === 'active' ? 'Agora' : startDate} \\- ${endDate}_`,
  ].join('\n')
}