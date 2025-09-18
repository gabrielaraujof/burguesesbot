import type { FreeGamesProvider } from './provider.interface.js'
import type { FreeGamesPromotionsResponse } from './freegames.interface.js'

export class MockFreeGamesProvider implements FreeGamesProvider {
  constructor(private data: FreeGamesPromotionsResponse) {}
  async getPromotions(): Promise<FreeGamesPromotionsResponse> {
    return this.data
  }
}
