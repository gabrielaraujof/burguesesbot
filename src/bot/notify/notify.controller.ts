import { Body, Controller, Logger, Post } from '@nestjs/common';

import { NotificationDto } from './notify.model';

import { NotifyService } from './notify.service';

@Controller('notify')
export class NotifyController {
  private readonly logger = new Logger(NotifyController.name);

  constructor(private notifyService: NotifyService) {}

  @Post()
  async notifyGroup(@Body() payload: NotificationDto) {
    this.logger.log(`Request for notification: ${JSON.stringify(payload)}`);
    await this.notifyService.notify(payload.chatId, payload.message);
    this.logger.log(`Notification sent.`);
  }
}
