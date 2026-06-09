import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { LoggerService } from '@app/logger';
import { PAYMENT_SERVICE, PAYMENTS_TCP_PATTERNS } from '@app/payments';
import { firstValueFrom } from 'rxjs';

export class ToggleAutoRenewalCommand {
  constructor(
    public readonly userId: string,
    public readonly autoRenewal: boolean,
  ) {}
}

@CommandHandler(ToggleAutoRenewalCommand)
export class ToggleAutoRenewalUseCase implements ICommandHandler<ToggleAutoRenewalCommand, void> {
  constructor(
    @Inject(PAYMENT_SERVICE) private readonly paymentClient: ClientProxy,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(ToggleAutoRenewalUseCase.name);
  }

  async execute({ userId, autoRenewal }: ToggleAutoRenewalCommand): Promise<void> {
    this.logger.log(
      `TOGGLE auto renewal START userId=${userId} autoRenewal=${autoRenewal}`,
      'execute',
    );

    await firstValueFrom(
      this.paymentClient.send<null>(PAYMENTS_TCP_PATTERNS.TOGGLE_AUTO_RENEWAL, {
        userId,
        autoRenewal,
      }),
    );

    this.logger.log(`TOGGLE auto renewal DONE`, 'execute');
  }
}
