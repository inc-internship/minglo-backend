import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { EmailService } from '@app/notifications';
import { LoggerService } from '@app/logger';

export interface UserRegisteredEventProps {
  email: string;
  redirectUrl: string;
  code: string;
}

export class UserRegisteredEvent {
  public readonly email: string;
  public readonly redirectUrl: string;
  public readonly code: string;

  constructor(props: UserRegisteredEventProps) {
    this.email = props.email;
    this.redirectUrl = props.redirectUrl;
    this.code = props.code;
  }
}

@EventsHandler(UserRegisteredEvent)
export class UserRegisteredHandler implements IEventHandler<UserRegisteredEvent> {
  constructor(
    private readonly emailService: EmailService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(UserRegisteredHandler.name);
  }

  handle(event: UserRegisteredEvent): void {
    const { email, redirectUrl, code } = event;
    this.logger.log('Sending confirmation email', 'handle');
    void this.emailService
      .sendConfirmationEmail({ email, redirectUrl, code })
      .catch((exception) => {
        this.logger.error(exception, `Failed to send confirmation email to ${email}`);
      });
  }
}
