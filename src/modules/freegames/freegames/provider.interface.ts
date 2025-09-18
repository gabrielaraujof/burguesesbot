import type { FreeGamesPromotionsResponse } from './freegames.interface.js'

export interface FreeGamesProvider {
  getPromotions(): Promise<FreeGamesPromotionsResponse>
}
