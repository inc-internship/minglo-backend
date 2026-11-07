import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { SubscriptionActivatedPayload } from '@app/payments';
import { UserRepository } from '../../../user-account/infrastructure';
import { AccountType, NotificationType } from '../../../../shared/enums';
import { NotificationService } from '../../../notifications/application/services/notification.service';
import { format } from 'date-fns';

export class ActivateSubscriptionCommand {
  constructor(public readonly payload: SubscriptionActivatedPayload) {}
}

@CommandHandler(ActivateSubscriptionCommand)
export class ActivateSubscriptionUseCase implements ICommandHandler<
  ActivateSubscriptionCommand,
  void
> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly notificationService: NotificationService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(ActivateSubscriptionUseCase.name);
  }

  async execute({ payload }: ActivateSubscriptionCommand): Promise<void> {
    this.logger.log(
      `Activating subscription for userId=${payload.userId}, expiresAt=${payload.expiresAt}`,
      'execute',
    );

    await this.userRepository.updateAccountType(payload.userId, AccountType.BUSINESS);
    this.logger.log(`accountType set to BUSINESS for userId=${payload.userId}`, 'execute');

    const formattedExpiresAt = format(new Date(payload.expiresAt), 'dd.MM.yyyy');
    await this.notificationService.createAndEmit(
      payload.userId,
      NotificationType.SUBSCRIPTION_ACTIVATED,
      `Subscription activated until ${formattedExpiresAt}`,
    );
    this.logger.log(
      `Subscription activation notification sent to user with id: ${payload.userId}`,
      'execute',
    );
  }
}
