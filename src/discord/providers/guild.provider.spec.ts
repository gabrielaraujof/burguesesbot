import { Test, TestingModule } from '@nestjs/testing';
import { GuildProvider } from './guild.provider';
import { ConfigService } from '@nestjs/config';

describe('GuildProvider', () => {
  let provider: GuildProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GuildProvider],
    })
      .useMocker((token) => {
        if (token === ConfigService) {
          return { get: jest.fn() };
        } else {
          return { guilds: { cache: { get: jest.fn() } } };
        }
      })
      .compile();

    provider = module.get<GuildProvider>(GuildProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
