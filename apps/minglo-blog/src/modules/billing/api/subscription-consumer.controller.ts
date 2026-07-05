import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { EventPattern, Payload } from '@nestjs/microservices';
import { LoggerService } from '@app/logger';
import {
  SUBSCRIPTION_EVENTS,
  type SubscriptionActivatedPayload,
  type SubscriptionPendingPayload,
} from '@app/payments';
import { ActivateSubscriptionCommand, SubscriptionPendingCommand } from '../application/usecases';

// RabbitMQ consumer
@Controller()
export class SubscriptionConsumerController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(SubscriptionConsumerController.name);
  }

  @EventPattern(SUBSCRIPTION_EVENTS.ACTIVATED)
  async handleSubscriptionActivated(
    @Payload() payload: SubscriptionActivatedPayload,
  ): Promise<void> {
    this.logger.log(
      `Received subscription.activated: userId=${payload.userId}`,
      'handleSubscriptionActivated',
    );
    await this.commandBus.execute(new ActivateSubscriptionCommand(payload));
  }

  @EventPattern(SUBSCRIPTION_EVENTS.PENDING)
  async handleSubscriptionPending(@Payload() payload: SubscriptionPendingPayload): Promise<void> {
    this.logger.log(
      `Received subscription.pending: userId=${payload.userId}`,
      'handleSubscriptionPending',
    );
    await this.commandBus.execute(new SubscriptionPendingCommand(payload));
  }
}
