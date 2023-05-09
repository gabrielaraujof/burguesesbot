import { Test, TestingModule } from '@nestjs/testing';
import { Chat } from './chat';
import { ChatgptService } from '../chatgpt/chatgpt.service';

describe('Chat', () => {
  let provider: Chat;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Chat,
        { provide: ChatgptService, useValue: { prompt: jest.fn() } },
      ],
    }).compile();

    provider = module.get<Chat>(Chat);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
