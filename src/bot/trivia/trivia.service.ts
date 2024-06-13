import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { CategoryId, Difficulty, TriviaResponse } from './trivia.interface';
import { firstValueFrom, map } from 'rxjs';
import { toQuiz } from './trivia.helper';

type GetQuestionsOpts = {
  amount?: number;
  difficulty: Difficulty;
  category: CategoryId;
};

@Injectable()
export class TriviaService {
  private readonly logger = new Logger(TriviaService.name);

  constructor(private readonly http: HttpService) {}

  getQuestions({ amount = 1, difficulty, category }: GetQuestionsOpts) {
    this.logger.log(
      `Requesting a ${difficulty} trivia question about category ${category}...`,
    );
    const request$ = this.http
      .get<TriviaResponse>(`https://opentdb.com/api.php`, {
        params: {
          amount,
          category,
          difficulty,
          encode: 'base64',
        },
      })
      .pipe(
        map((response) => response.data.results),
        map((trivias) => trivias.map(toQuiz)),
      );

    return firstValueFrom(request$);
  }
}
