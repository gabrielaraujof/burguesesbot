import { Module } from '@nestjs/common';
import { ChatService } from './providers/chat.service';

@Module({
  providers: [ChatService],
  exports: [ChatService],
})
export class AiModule {}
