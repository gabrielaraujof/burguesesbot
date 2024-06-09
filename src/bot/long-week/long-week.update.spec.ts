import { Test, TestingModule } from '@nestjs/testing';
import { LongWeekUpdate } from './long-week.update';
import { Context } from 'telegraf';
import { FreegamesService } from '../freegames/freegames.service';

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

  it('should reply with "Foda-se." and the user name', async () => {
    const ctx = {
      message: {
        from: {
          first_name: 'John',
          last_name: 'Doe',
        },
      },
      replyWithMarkdownV2: jest.fn(),
    } as unknown as Context;

    await service.fuck(ctx, 'John', 'Doe');

    expect(ctx.replyWithMarkdownV2).toBeCalledWith(
      'Foda\\-se\\.\n\\- _Doe, John_',
    );
  });
});
