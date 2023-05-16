import { Test, TestingModule } from '@nestjs/testing';
import { NotifyService } from './notify.service';
import { Context, Telegraf } from 'telegraf';
import { DEFAULT_BOT_NAME } from 'nestjs-telegraf';

describe('Notify Service', () => {
  let service: NotifyService;
  let bot: Telegraf<Context>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotifyService,
        {
          provide: DEFAULT_BOT_NAME,
          useValue: {
            telegram: {
              sendMessage: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<NotifyService>(NotifyService);
    bot = module.get<Telegraf<Context>>(DEFAULT_BOT_NAME);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call notify method', async () => {
    const chatId = '123';
    const message = 'Hello World';

    service.notify(chatId, message);

    expect(bot.telegram.sendMessage).toBeCalledWith(chatId, message);
  });
});
