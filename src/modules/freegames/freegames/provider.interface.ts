import type { FreeGamesPromotionsResponse, FreeGame } from './freegames.interface.js'

export interface FreeGamesProvider {
  getPromotions(): Promise<FreeGamesPromotionsResponse>
  getFreeGames(): Promise<FreeGame[]>
}
