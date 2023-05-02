import { Test, TestingModule } from '@nestjs/testing';
import { NotifyController } from './notify.controller';
import { NotifyService } from './notify.service';

describe('Notify Controller', () => {
  let controller: NotifyController;
  let service: NotifyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotifyController],
      providers: [
        {
          provide: NotifyService,
          useValue: {
            notify: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<NotifyController>(NotifyController);
    service = module.get<NotifyService>(NotifyService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call notifyGroup method', async () => {
    const payload = {
      chatId: '123',
      message: 'Hello World',
    };

    controller.notifyGroup(payload);

    expect(service.notify).toBeCalledWith(payload.chatId, payload.message);
  });
});
