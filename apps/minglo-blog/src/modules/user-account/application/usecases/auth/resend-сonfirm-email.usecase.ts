import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../../../infrastructure/user.repository';
import { DomainException, DomainExceptionCode } from '@app/exceptions';

export class ResendConfirmEmailCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(ResendConfirmEmailCommand)
export class ResendConfirmEmailUseCase implements ICommandHandler<ResendConfirmEmailCommand, void> {
  constructor(private readonly userRepo: UserRepository) {}

  async execute({ email }: ResendConfirmEmailCommand): Promise<void> {
    const user = await this.userRepo.findByEmail(email);

    if (user.emailConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email already confirmed',
        extensions: [{ field: 'email', message: 'Email already confirmed' }],
      });
    }
  }
}
