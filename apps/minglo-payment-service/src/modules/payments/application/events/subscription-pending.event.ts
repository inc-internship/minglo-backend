import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { Inject } from '@nestjs/common';
import {
  PAYMENTS_RMQ_CLIENT,
  SUBSCRIPTION_EVENTS,
  SubscriptionPendingPayload,
} from '@app/payments';
import { ClientProxy } from '@nestjs/microservices';

export class SubscriptionPendingEvent {
  constructor(
    public readonly userId: string,
    public readonly startsAt: Date,
    public readonly expiresAt: Date,
  ) {}
}

@EventsHandler(SubscriptionPendingEvent)
export class SubscriptionPendingHandler implements IEventHandler<SubscriptionPendingEvent> {
  constructor(
    @Inject(PAYMENTS_RMQ_CLIENT) private readonly rmqClient: ClientProxy,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(SubscriptionPendingHandler.name);
  }

  handle({ userId, startsAt, expiresAt }: SubscriptionPendingEvent) {
    const payload: SubscriptionPendingPayload = {
      userId,
      startsAt: startsAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    this.rmqClient.emit(SUBSCRIPTION_EVENTS.PENDING, payload);

    this.logger.log(
      `subscription.pending emitted to RabbitMQ: userId=${userId}, startsAt=${payload.startsAt}`,
      'handle',
    );
  }
}
