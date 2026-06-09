import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { PaymentsRepository } from '../../infrastructure';

export class ToggleAutoRenewalCommand {
  constructor(
    public readonly userId: string,
    public readonly autoRenewal: boolean,
  ) {}
}

@CommandHandler(ToggleAutoRenewalCommand)
export class ToggleAutoRenewalUseCase implements ICommandHandler<ToggleAutoRenewalCommand, void> {
  constructor(
    private readonly repo: PaymentsRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(ToggleAutoRenewalUseCase.name);
  }

  async execute({ userId, autoRenewal }: ToggleAutoRenewalCommand): Promise<void> {
    this.logger.log(
      `toggle_auto_renewal START userId=${userId} autoRenewal=${autoRenewal}`,
      'execute',
    );
    await this.repo.setAutoRenewal(userId, autoRenewal);
    this.logger.log(`toggle_auto_renewal DONE`, 'execute');
  }
}
