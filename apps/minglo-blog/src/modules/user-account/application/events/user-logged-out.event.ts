import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { NotificationsGateway } from '../../../notifications/api/notifications.gateway';
import { LoggerService } from '@app/logger';

export class UserLoggedOutEvent {
  constructor(public readonly userId: string) {}
}

@EventsHandler(UserLoggedOutEvent)
export class UserLoggedOutEventHandler implements IEventHandler<UserLoggedOutEvent> {
  constructor(
    private readonly gateway: NotificationsGateway,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(UserLoggedOutEventHandler.name);
  }

  handle(event: UserLoggedOutEvent): void {
    this.logger.log(`Disconnecting WS for userId=${event.userId}`, 'handle');
    this.gateway.disconnectUser(event.userId);
  }
}
