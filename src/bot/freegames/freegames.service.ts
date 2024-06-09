import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom, map } from 'rxjs';
import { formatDate, freeGameOnly } from './freegames.helper';
import { FreeGame, FreeGamesPromotionsResponse } from './freegames.interface';
import { ConfigService } from '@nestjs/config';
import {
  FreeGamesPromotionsUrl,
  ProductStoreUrl,
} from '../../helper/constants';

@Injectable()
export class FreegamesService {
  private readonly logger = new Logger(FreegamesService.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  getFreeGames() {
    const url = this.config.get(FreeGamesPromotionsUrl);
    if (!url) {
      throw new Error(`FreeGamesPromotionsUrl not defined`);
    }

    this.logger.log('Getting free games promotions');

    const request$ = this.http.get<FreeGamesPromotionsResponse>(url).pipe(
      map(({ data }) => data.data.Catalog.searchStore.elements),
      map(freeGameOnly),
    );

    return firstValueFrom(request$);
  }

  buildPhotoCaption(game: FreeGame): string {
    const startDate = formatDate(game.start);
    const endDate = formatDate(game.end);
    const storeUrl = this.config.get(ProductStoreUrl, '#');
    return [
      `[*${game.title}*\](${storeUrl}/${game.slug})`,
      game.state === 'active' ? `🟢 *JÁ DISPONÍVEL* 🟢` : 'EM BREVE',
      `_${game.state === 'active' ? 'Agora' : startDate} \\- ${endDate}_`,
    ].join('\n');
  }
}
