import { Test, TestingModule } from '@nestjs/testing';
import { GuildProvider } from './guild.provider';

describe('GuildProvider', () => {
  let provider: GuildProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GuildProvider],
    }).compile();

    provider = module.get<GuildProvider>(GuildProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
