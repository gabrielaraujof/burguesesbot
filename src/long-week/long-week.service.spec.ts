import { Test, TestingModule } from '@nestjs/testing';
import { LongWeekService } from './long-week.service';

describe('LongWeekService', () => {
  let service: LongWeekService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LongWeekService],
    }).compile();

    service = module.get<LongWeekService>(LongWeekService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
