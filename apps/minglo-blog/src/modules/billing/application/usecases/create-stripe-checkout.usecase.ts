import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { LoggerService } from '@app/logger';
import { PAYMENT_SERVICE } from '@app/payments';

export class CreateStripeCheckoutCommand {
  constructor(
    public readonly userId: string,
    public readonly planId: string,
  ) {}
}

@CommandHandler(CreateStripeCheckoutCommand)
export class CreateStripeCheckoutUseCase implements ICommandHandler<
  CreateStripeCheckoutCommand,
  { checkoutUrl: string }
> {
  constructor(
    @Inject(PAYMENT_SERVICE)
    private readonly paymentClient: ClientProxy,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(CreateStripeCheckoutUseCase.name);
  }

  async execute({ userId, planId }: CreateStripeCheckoutCommand): Promise<{ checkoutUrl: string }> {
    this.logger.log(
      `Sending create_stripe_checkout to payments-service, userId=${userId}`,
      'execute',
    );

    return firstValueFrom(
      this.paymentClient.send<{ checkoutUrl: string }>('create_stripe_checkout', {
        userId,
        planId,
      }),
    );
  }
}
