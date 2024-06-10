import { Test, TestingModule } from '@nestjs/testing';
import { LongWeekUpdate } from './long-week.update';
import { Context } from 'telegraf';
import { FreegamesService } from '../freegames/freegames.service';
import { TriviaService } from '../trivia/trivia.service';

const greeGamesMock = [
  {
    id: '1',
    title: 'Game 1',
    slug: 'game-1',
    photo: 'https://example.com/game-1.jpg',
    start: new Date('2021-01-01'),
    end: new Date('2021-01-02'),
    state: 'active',
  },
  {
    id: '2',
    title: 'Game 2',
    slug: 'game-2',
    photo: 'https://example.com/game-2.jpg',
    start: new Date('2021-01-03'),
    end: new Date('2021-01-04'),
    state: 'active',
  },
];

describe('LongWeekService', () => {
  let service: LongWeekUpdate;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LongWeekUpdate,
        {
          provide: FreegamesService,
          useValue: {
            getFreeGames: jest.fn().mockResolvedValue(greeGamesMock),
            buildPhotoCaption: jest.fn(() => 'caption'),
          },
        },
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

    service = module.get<LongWeekUpdate>(LongWeekUpdate);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should reply with "cadê a live?"', async () => {
    const ctx = { reply: jest.fn() } as unknown as Context;

    await service.LongWeekReply(ctx);

    expect(ctx.reply).toBeCalledWith('cadê a live?');
  });
});
