import { Injectable } from '@nestjs/common';

const longWeekRegex = /semana\s+longa/i;

@Injectable()
export class LongWeekService {
  isTriggeredBy(text: string) {
    return longWeekRegex.test(text);
  }
  reply() {
    return 'cadê a live?';
  }
}
