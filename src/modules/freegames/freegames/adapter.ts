import type { FreeGamesProvider } from './provider.interface.js'
import type { FreeGame } from './freegames.interface.js'
import { getFreeGames as fetchFreeGames } from './freegames.service.js'

export class FreeGamesServiceProviderAdapter implements FreeGamesProvider {
  constructor(private readonly maxRetries = 2, private readonly delayMs = 200) {}

  async getPromotions(): Promise<any> {
    // Expose raw promotions is not directly supported by current service; return empty shape for now
    return { data: { Catalog: { searchStore: { elements: [], paging: { count: 0, total: 0 } } } } }
  }

  async getFreeGames(): Promise<FreeGame[]> {
    let attempt = 0
    while (true) {
      attempt++
      try {
        return await fetchFreeGames()
      } catch (err: any) {
        if (attempt > this.maxRetries) throw err
        await this.sleep(this.delayMs * 2 ** (attempt - 1))
      }
    }
  }

  private sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms))
  }
}
