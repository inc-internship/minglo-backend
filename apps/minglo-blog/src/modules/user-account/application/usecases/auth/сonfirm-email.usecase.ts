import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../../../infrastructure';
import { LoggerService } from '@app/logger';

export class ConfirmEmailCommand {
  constructor(public readonly code: string) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase implements ICommandHandler<ConfirmEmailCommand, void> {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(ConfirmEmailUseCase.name);
  }

  async execute({ code }: ConfirmEmailCommand): Promise<void> {
    const user = await this.userRepo.findByConfirmationCode(code);

    user.emailConfirmation.validate();
    this.logger.log('Confirmation code validated', 'execute');
    user.confirm();

    await this.userRepo.confirmEmail(user);
    this.logger.log('User email confirmed', 'execute');
  }
}
