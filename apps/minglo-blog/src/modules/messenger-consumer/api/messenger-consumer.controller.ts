import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { EventPattern, Payload } from '@nestjs/microservices';
import { LoggerService } from '@app/logger';
import { MESSENGER_EVENTS, type MessageSentPayload } from '@app/messenger';
import { NewMessageNotificationCommand } from '../application/usecases/new-message-notification.usecase';

// RabbitMQ consumer
@Controller()
export class MessengerConsumerController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(MessengerConsumerController.name);
  }

  @EventPattern(MESSENGER_EVENTS.MESSAGE_SENT)
  async handleMessageSent(@Payload() payload: MessageSentPayload): Promise<void> {
    this.logger.log(
      `Received ${MESSENGER_EVENTS.MESSAGE_SENT}: conversationId=${payload.conversationId}, sender=${payload.senderPublicId}`,
      'handleMessageSent',
    );
    await this.commandBus.execute(new NewMessageNotificationCommand(payload));
  }
}