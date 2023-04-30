import { Test, TestingModule } from '@nestjs/testing';
import { LongWeekUpdate } from './long-week.update';
import { Context } from 'telegraf';
import { Message, Update } from 'typegram';

describe('LongWeekService', () => {
  let service: LongWeekUpdate;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LongWeekUpdate],
    }).compile();

    service = module.get<LongWeekUpdate>(LongWeekUpdate);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should reply with "cadê a live?"', async () => {
    const ctx = {
      reply: jest.fn(),
    } as unknown as Context<Update.MessageUpdate<Message.TextMessage>>;

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
    } as unknown as Context<Update.MessageUpdate<Message.TextMessage>>;

    await service.fuck(ctx);

    expect(ctx.replyWithMarkdownV2).toBeCalledWith(
      'Foda\\-se\\.\n\\- _Doe, John_',
    );
  });
});
