import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { SubscriptionPendingPayload } from '@app/payments';
import { NotificationType } from '../../../../shared/enums';
import { NotificationService } from '../../../notifications/application/services/notification.service';
import { format } from 'date-fns';

export class SubscriptionPendingCommand {
  constructor(public readonly payload: SubscriptionPendingPayload) {}
}

@CommandHandler(SubscriptionPendingCommand)
export class SubscriptionPendingUseCase implements ICommandHandler<
  SubscriptionPendingCommand,
  void
> {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(SubscriptionPendingUseCase.name);
  }

  async execute({ payload }: SubscriptionPendingCommand): Promise<void> {
    this.logger.log(`Processing pending subscription for userId=${payload.userId}`, 'execute');

    const startsAt = format(new Date(payload.startsAt), 'dd.MM.yyyy');
    const expiresAt = format(new Date(payload.expiresAt), 'dd.MM.yyyy');

    await this.notificationService.createAndEmit(
      payload.userId,
      NotificationType.SUBSCRIPTION_PENDING,
      `Your subscription has been purchased and will activate on ${startsAt} until ${expiresAt}`,
    );

    this.logger.log(
      `Subscription pending notification sent to userId=${payload.userId}`,
      'execute',
    );
  }
}
