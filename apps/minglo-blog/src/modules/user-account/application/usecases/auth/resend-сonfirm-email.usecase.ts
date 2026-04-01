import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { EmailConfirmationRepository, UserRepository } from '../../../infrastructure';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { UserRegisteredEvent } from '../../events';
import { LoggerService } from '@app/logger';

export class ResendConfirmEmailCommand {
  constructor(
    public readonly email: string,
    public readonly redirectUrl: string,
  ) {}
}

@CommandHandler(ResendConfirmEmailCommand)
export class ResendConfirmEmailUseCase implements ICommandHandler<ResendConfirmEmailCommand, void> {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly emailConfirmationRepo: EmailConfirmationRepository,
    private readonly eventBus: EventBus,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(ResendConfirmEmailUseCase.name);
  }

  async execute({ email, redirectUrl }: ResendConfirmEmailCommand): Promise<void> {
    const user = await this.userRepo.findByEmailOrFail(email);

    if (user.emailConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email already confirmed',
        extensions: [{ field: 'email', message: 'Email already confirmed' }],
      });
    }

    // Обновляем проверочный код и срок действия и
    // повторяем отправку письма с кодом подтверждения
    user.emailConfirmation.regenerate();
    const { id, code, expiresAt } = user.emailConfirmation;
    await this.emailConfirmationRepo.updateCodeAndExp({ id, code, expiresAt });
    this.logger.log('Confirmation code regenerated and saved', 'execute');

    this.eventBus.publish(new UserRegisteredEvent({ email, code, redirectUrl }));
    this.logger.log('UserRegisteredEvent published', 'execute');

    return;
  }
}
