import { IsString } from 'class-validator';

export class NotificationDto {
  @IsString()
  chatId: string;

  @IsString()
  message: string;
}
