import ky from 'ky'

import type { FreeGamesPromotionsResponse } from './freegames.interface.js'
import { freeGameOnly } from './freegames.helper.js'

const FreeGamesPromotionsUrl = process.env.FREE_GAMES_PROMOTIONS_URL ?? ''

export function getFreeGames() {
  console.log('Getting free games promotions')

  return ky
    .get(FreeGamesPromotionsUrl)
    .then((response) => response.json<FreeGamesPromotionsResponse>())
    .then(({ data }) => data.Catalog.searchStore.elements)
    .then(freeGameOnly)
}
