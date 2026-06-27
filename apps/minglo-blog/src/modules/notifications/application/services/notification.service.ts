import { Injectable } from '@nestjs/common';
import { NotificationRepository } from '../../infrastructure/notification.repository';
import { NotificationsGateway } from '../../api/notifications.gateway';
import { NotificationViewDto } from '../../api/view-dto/notification.view-dto';
import { NotificationType } from '../../../../shared/enums';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepo: NotificationRepository,
    private readonly gateway: NotificationsGateway,
  ) {}

  async createAndEmit(userId: string, type: NotificationType, message: string): Promise<void> {
    const notification = await this.notificationRepo.create({ userId, type, message });
    this.gateway.emitNotification(userId, NotificationViewDto.mapToView(notification));
  }
}
