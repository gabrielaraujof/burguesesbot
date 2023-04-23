import { Module } from '@nestjs/common';
import { LongWeekUpdate } from './long-week.update';

@Module({
  providers: [LongWeekUpdate],
})
export class LongWeekModule {}
