import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { PasswordRecoveryInputDto } from '../../../api/input-dto';
import { UserRepository } from '../../../infrastructure';
import { LoggerService } from '@app/logger';
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
    private readonly userRepo: UserRepository,
    private eventBus: EventBus,
    private logger: LoggerService,
  ) {}

  async execute({ body }: PasswordRecoveryUseCaseCommand): Promise<void> {
    const { email, redirectUrl } = body;

    this.logger.log(`Attempt to recover password, user email: ${email}`, 'execute');

    const user = await this.userRepo.findByEmail(email);

    if (!user) {
      this.logger.warn(`User not found, returning 204 silently`, 'execute');
      return;
    }

    const recoveryData = user.generatePasswordRecovery();

    await this.userRepo.savePasswordRecovery(recoveryData);

    this.eventBus.publish(new PasswordRecoveryEvent(email, redirectUrl, recoveryData.recoveryCode));

    this.logger.log(
      `New Password Recovery data successfully generated, user email: ${email}`,
      'execute',
    );
  }
}
