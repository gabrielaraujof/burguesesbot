import { Module } from '@nestjs/common';
import { LongWeekUpdate } from './long-week.update';
import { LongWeekService } from './long-week.service';

@Module({
  providers: [LongWeekUpdate, LongWeekService],
})
export class LongWeekModule {}
