import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotificationRepository } from '../../infrastructure/notification.repository';
import { NotificationsWithCursorViewDto } from '../../api/view-dto/notifications-with-cursor.view-dto';

export class GetNotificationsQuery {
  constructor(
    public readonly userId: string,
    public readonly cursor?: string,
  ) {}
}

@QueryHandler(GetNotificationsQuery)
export class GetNotificationsHandler implements IQueryHandler<
  GetNotificationsQuery,
  NotificationsWithCursorViewDto
> {
  constructor(private readonly notificationRepo: NotificationRepository) {}

  async execute({
    userId,
    cursor,
  }: GetNotificationsQuery): Promise<NotificationsWithCursorViewDto> {
    return this.notificationRepo.findManyByUserIdWithCursor(userId, cursor);
  }
}
