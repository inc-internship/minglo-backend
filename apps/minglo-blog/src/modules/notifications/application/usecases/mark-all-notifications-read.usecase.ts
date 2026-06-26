import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotificationRepository } from '../../infrastructure/notification.repository';

export class MarkAllNotificationsReadCommand {
  constructor(public readonly userId: string) {}
}

@CommandHandler(MarkAllNotificationsReadCommand)
export class MarkAllNotificationsReadUseCase implements ICommandHandler<
  MarkAllNotificationsReadCommand,
  void
> {
  constructor(private readonly notificationRepo: NotificationRepository) {}

  async execute({ userId }: MarkAllNotificationsReadCommand): Promise<void> {
    await this.notificationRepo.markAllRead(userId);
  }
}
