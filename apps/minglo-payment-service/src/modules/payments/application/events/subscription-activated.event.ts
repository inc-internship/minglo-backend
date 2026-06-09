import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';

export class SubscriptionActivatedEvent {
  constructor(
    public readonly userId: string,
    public readonly expiresAt: Date, // new subscription endDate
  ) {}
}

// TODO BE-6: заменить лог на публикацию в RabbitMQ.
// Сейчас только логируем — accountType в minglo-blog НЕ обновляется.
// После BE-6: this.rmqClient.emit(SUBSCRIPTION_EVENTS.ACTIVATED, { userId, expiresAt })
@EventsHandler(SubscriptionActivatedEvent)
export class SubscriptionActivatedHandler implements IEventHandler<SubscriptionActivatedEvent> {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(SubscriptionActivatedHandler.name);
  }

  handle({ userId, expiresAt }: SubscriptionActivatedEvent) {
    this.logger.log(
      `[TODO BE-6] subscription.activated: userId=${userId}, expiresAt=${expiresAt.toISOString()}`,
      'handle',
    );
    // TODO BE-6: опубликовать в RabbitMQ:
    // this.rmqClient.emit(SUBSCRIPTION_EVENTS.ACTIVATED, {
    //   userId,
    //   expiresAt: expiresAt.toISOString(),
    // });
  }
}
