import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { PasswordRecoveryInputDto } from '../../../api/input-dto/password-recovery.input-dto';
import { UserRepository } from '../../../infrastructure';
import { LoggerService } from '@app/logger';
import { PasswordRecoveryEntity } from '../../../domains/entities/password-recovery.entity';
import { PasswordRecoveryRepository } from '../../../infrastructure/password-recovery.repository';
import { PasswordRecoveryEvent } from '../../events';

export class PasswordRecoveryUseCaseCommand {
  constructor(public readonly body: PasswordRecoveryInputDto) {}
}

@CommandHandler(PasswordRecoveryUseCaseCommand)
export class PasswordRecoveryUseCase implements ICommandHandler<
  PasswordRecoveryUseCaseCommand,
  void
> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly recoveryRepository: PasswordRecoveryRepository,
    private eventBus: EventBus,
    private logger: LoggerService,
  ) {}

  async execute(command: PasswordRecoveryUseCaseCommand): Promise<void> {
    const { body } = command;

    const user = await this.userRepository.getByEmail(body.email);
    this.logger.log(`Attempt to recover password for non-existent email: ${body.email}`);
    if (!user) return;

    const recovery: PasswordRecoveryEntity = PasswordRecoveryEntity.create(user.id);

    await this.recoveryRepository.create(recovery);
    this.logger.log(
      `User save history recovery-password in DB, publicId: ${recovery.userId}`,
      'execute',
    );

    this.eventBus.publish(
      new PasswordRecoveryEvent(body.email, body.redirectUrl, recovery.recoveryCode),
    );
    this.logger.log(`Password recovery code generated for user: ${user.publicId}`, 'execute');
  }
}
