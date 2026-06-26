import { ApiProperty } from '@nestjs/swagger';
import { Notification, NotificationType } from '../../../../../prisma/generated/prisma/client';

export class NotificationViewDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: NotificationType })
  type: NotificationType;

  @ApiProperty()
  message: string;

  @ApiProperty()
  isRead: boolean;

  @ApiProperty()
  createdAt: Date;

  static mapToView(notification: Notification): NotificationViewDto {
    const dto = new NotificationViewDto();
    dto.id = notification.id;
    dto.type = notification.type;
    dto.message = notification.message;
    dto.isRead = notification.isRead;
    dto.createdAt = notification.createdAt;
    return dto;
  }
}
