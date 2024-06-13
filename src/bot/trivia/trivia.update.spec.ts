import { Test, TestingModule } from '@nestjs/testing';
import { TriviaUpdate } from './trivia.update';
import { TriviaService } from './trivia.service';

describe('TriviaUpdate', () => {
  let provider: TriviaUpdate;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TriviaUpdate,
        {
          provide: TriviaService,
          useValue: {
            getQuestions: jest.fn().mockResolvedValue([
              {
                title: 'Question 1',
                options: ['A', 'B', 'C'],
                correctOptionIndex: 1,
              },
            ]),
          },
        },
      ],
    }).compile();

    provider = module.get<TriviaUpdate>(TriviaUpdate);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
