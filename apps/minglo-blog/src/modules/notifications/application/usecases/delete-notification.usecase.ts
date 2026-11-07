import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotificationRepository } from '../../infrastructure/notification.repository';

export class DeleteNotificationCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}

@CommandHandler(DeleteNotificationCommand)
export class DeleteNotificationUseCase implements ICommandHandler<DeleteNotificationCommand, void> {
  constructor(private readonly notificationRepo: NotificationRepository) {}

  async execute({ id, userId }: DeleteNotificationCommand): Promise<void> {
    await this.notificationRepo.findByIdAndUserId(id, userId);
    await this.notificationRepo.deleteById(id);
  }
}
