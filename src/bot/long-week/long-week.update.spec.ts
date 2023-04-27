import { Test, TestingModule } from '@nestjs/testing';
import { LongWeekUpdate } from './long-week.update';

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
});
