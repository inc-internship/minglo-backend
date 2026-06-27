import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { LoggerService } from 'libs/logger/src';
import { PAYMENT_SERVICE, PAYMENTS_TCP_PATTERNS } from 'libs/payments/src';

export class UserDeletedEvent {
  constructor(public readonly userId: string) {}
}

@EventsHandler(UserDeletedEvent)
export class UserDeletedHandler implements IEventHandler<UserDeletedEvent> {
  constructor(
    @Inject(PAYMENT_SERVICE) private readonly paymentClient: ClientProxy,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(UserDeletedHandler.name);
  }

  handle(event: UserDeletedEvent): void {
    this.logger.log(
      `Sending delete_user_data to payment-service for userId=${event.userId}`,
      'handle',
    );
    this.paymentClient.emit(PAYMENTS_TCP_PATTERNS.DELETE_USER_DATA, { userId: event.userId });
  }
}
