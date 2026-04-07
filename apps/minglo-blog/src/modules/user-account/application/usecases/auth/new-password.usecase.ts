import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../../../infrastructure';
import { LoggerService } from '@app/logger';
import { NewPasswordInputDto } from '../../../api/input-dto/new-password.input-dto';
import { CryptoService } from '../../services';
import { DomainException, DomainExceptionCode } from '@app/exceptions';

export class NewPasswordCommand {
  constructor(public readonly body: NewPasswordInputDto) {}
}

@CommandHandler(NewPasswordCommand)
export class NewPasswordUseCase implements ICommandHandler<NewPasswordCommand, void> {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly cryptoService: CryptoService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(NewPasswordUseCase.name);
  }

  async execute({ body }: NewPasswordCommand): Promise<void> {
    const { recoveryCode, newPassword } = body;

    this.logger.log(`Find user by recoveryCode:${recoveryCode}`);
    const user = await this.userRepo.findByRecoveryCode(recoveryCode);

    user.passwordRecoveries.validate();
    this.logger.log('Confirmation code validated', 'execute');

    const result = await this.cryptoService.comparePassword({
      password: newPassword,
      passwordHash: user.passwordHash,
    });
    if (result) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Invalid newPassword',
        extensions: [{ field: 'newPassword', message: 'New password must be different' }],
      });
    }

    this.logger.log('Hash password', 'execute');
    const passwordHash = await this.cryptoService.hashPassword(newPassword);

    user.updatePassword(passwordHash);

    await this.userRepo.confirmPasswordRecovery(user);
  }
}
