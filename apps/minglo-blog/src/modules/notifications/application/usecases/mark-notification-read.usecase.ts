import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotificationRepository } from '../../infrastructure/notification.repository';

export class MarkNotificationReadCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}

@CommandHandler(MarkNotificationReadCommand)
export class MarkNotificationReadUseCase implements ICommandHandler<
  MarkNotificationReadCommand,
  void
> {
  constructor(private readonly notificationRepo: NotificationRepository) {}

  async execute({ id, userId }: MarkNotificationReadCommand): Promise<void> {
    await this.notificationRepo.findByIdAndUserId(id, userId);
    await this.notificationRepo.markOneRead(id);
  }
}
