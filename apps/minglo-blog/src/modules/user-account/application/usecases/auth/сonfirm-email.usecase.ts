import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../../../infrastructure';

export class ConfirmEmailCommand {
  constructor(public readonly code: string) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase implements ICommandHandler<ConfirmEmailCommand, void> {
  constructor(private readonly userRepo: UserRepository) {}

  async execute({ code }: ConfirmEmailCommand): Promise<void> {
    const user = await this.userRepo.findByConfirmationCode(code);

    user.emailConfirmation.validate();

    user.confirm();

    await this.userRepo.confirmEmail(user);
  }
}
