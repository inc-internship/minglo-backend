import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { Inject } from '@nestjs/common';
import {
  PAYMENTS_RMQ_CLIENT,
  SUBSCRIPTION_EVENTS,
  SubscriptionActivatedPayload,
} from '@app/payments';
import { ClientProxy } from '@nestjs/microservices';

export class SubscriptionActivatedEvent {
  constructor(
    public readonly userId: string,
    public readonly expiresAt: Date, // new subscription endDate
  ) {}
}

@EventsHandler(SubscriptionActivatedEvent)
export class SubscriptionActivatedHandler implements IEventHandler<SubscriptionActivatedEvent> {
  constructor(
    @Inject(PAYMENTS_RMQ_CLIENT) private readonly rmqClient: ClientProxy,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(SubscriptionActivatedHandler.name);
  }

  handle({ userId, expiresAt }: SubscriptionActivatedEvent) {
    const payload: SubscriptionActivatedPayload = {
      userId,
      expiresAt: expiresAt.toISOString(),
    };

    this.rmqClient.emit(SUBSCRIPTION_EVENTS.ACTIVATED, payload);

    this.logger.log(
      `subscription.activated emitted to RabbitMQ: userId=${userId}, expiresAt=${payload.expiresAt}`,
      'handle',
    );
  }
}
