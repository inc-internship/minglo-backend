import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { EmailService } from '@app/notifications';
import { LoggerService } from '@app/logger';

export class OAuthUserRegisteredEvent {
  constructor(public readonly email: string) {}
}

@EventsHandler(OAuthUserRegisteredEvent)
export class OAuthUserRegisteredHandler implements IEventHandler<OAuthUserRegisteredEvent> {
  constructor(
    private readonly emailService: EmailService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(OAuthUserRegisteredHandler.name);
  }

  handle(event: OAuthUserRegisteredEvent): void {
    this.logger.log('Sending welcome email', 'handle');
    void this.emailService.sendWelcomeEmail(event.email).catch((exception) => {
      this.logger.error(exception, `Failed to send welcome email to ${event.email}`);
    });
  }
}
