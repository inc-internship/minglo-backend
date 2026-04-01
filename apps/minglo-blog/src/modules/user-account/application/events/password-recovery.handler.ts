import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { EmailService } from '@app/notifications';
import { LoggerService } from '@app/logger';

export class PasswordRecoveryEvent {
  constructor(
    public readonly email: string,
    public readonly redirectUrl: string,
    public readonly code: string,
  ) {}
}

@EventsHandler(PasswordRecoveryEvent)
export class PasswordRecoveryHandler implements IEventHandler<PasswordRecoveryEvent> {
  constructor(
    private readonly emailService: EmailService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(PasswordRecoveryHandler.name);
  }

  handle(event: PasswordRecoveryEvent): void {
    const { email, redirectUrl, code } = event;
    this.logger.log('Sending password-recovery email', 'handle');
    void this.emailService
      .sendPasswordRecoveryEmail({ email, redirectUrl, code })
      .catch((exception) => {
        this.logger.error(exception, `Failed to send password-recovery email to ${email}`);
      });
  }
}
