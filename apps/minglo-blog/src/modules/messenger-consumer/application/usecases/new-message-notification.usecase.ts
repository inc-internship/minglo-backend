import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { MessageSentPayload } from '@app/messenger';
import { NotificationService } from '../../../notifications/application/services/notification.service';
import { NotificationType } from '../../../../shared/enums';

export class NewMessageNotificationCommand {
  constructor(public readonly payload: MessageSentPayload) {}
}

@CommandHandler(NewMessageNotificationCommand)
export class NewMessageNotificationUseCase
  implements ICommandHandler<NewMessageNotificationCommand, void>
{
  constructor(
    private readonly notificationService: NotificationService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(NewMessageNotificationUseCase.name);
  }

  async execute({ payload }: NewMessageNotificationCommand): Promise<void> {
    const senderName = payload.senderLogin ?? 'Someone';
    const message = `New message from ${senderName}`;

    for (const recipientId of payload.recipientPublicIds) {
      await this.notificationService.createAndEmit(recipientId, NotificationType.NEW_MESSAGE, message);
    }

    this.logger.log(
      `NEW_MESSAGE notifications sent: conversationId=${payload.conversationId}, recipients=${payload.recipientPublicIds.length}`,
      'execute',
    );
  }
}