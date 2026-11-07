import { ApiProperty } from '@nestjs/swagger';
import { Notification } from '../../../../../prisma/generated/prisma/client';
import { NotificationType } from '../../../../shared/enums';

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
    dto.type = notification.type as unknown as NotificationType;
    dto.message = notification.message;
    dto.isRead = notification.isRead;
    dto.createdAt = notification.createdAt;
    return dto;
  }
}
