import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { EmailService } from '@app/notifications';

export class UserRegisteredEvent {
  constructor(
    public readonly email: string,
    public readonly redirectUrl: string,
    public readonly code: string,
  ) {}
}

@EventsHandler(UserRegisteredEvent)
export class UserRegisteredHandler implements IEventHandler<UserRegisteredEvent> {
  constructor(private readonly emailService: EmailService) {}

  handle(event: UserRegisteredEvent): void {
    const { email, redirectUrl, code } = event;

    void this.emailService.sendConfirmationEmail({ email, redirectUrl, code });
  }
}
