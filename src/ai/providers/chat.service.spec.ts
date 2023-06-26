import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';

describe('ChatService', () => {
  let provider: ChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatService],
    })
      .useMocker(() => ({
        get: jest.fn(),
      }))
      .compile();

    provider = module.get<ChatService>(ChatService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
