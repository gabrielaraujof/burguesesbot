import type { FreeGamesProvider } from './provider.interface.js'
import type { FreeGamesPromotionsResponse, FreeGame } from './freegames.interface.js'

export class MockFreeGamesProvider implements FreeGamesProvider {
  constructor(private data: FreeGamesPromotionsResponse) {}
  async getPromotions(): Promise<FreeGamesPromotionsResponse> {
    return this.data
  }
  // Minimal implementation to satisfy the interface for tests/typechecks
  async getFreeGames(): Promise<FreeGame[]> {
    return []
  }
}
