import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { PaymentsRepository } from '../../infrastructure';
import { StripeService } from '../../../stripe/stripe.service';
import { addDays } from 'date-fns';

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
    private readonly repo: PaymentsRepository,
    private readonly stripeService: StripeService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(CreateStripeCheckoutUseCase.name);
  }

  async execute({ userId, planId }: CreateStripeCheckoutCommand): Promise<{ checkoutUrl: string }> {
    this.logger.log(`START userId=${userId}, planId=${planId}`, 'execute');

    const plan = await this.repo.findPlanByIdOrFail(planId);

    const customerId = await this.getOrCreateStripeCustomer(userId);

    const latestEndDate = await this.repo.findLatestEndDate(userId);
    const startDate = latestEndDate && latestEndDate > new Date() ? latestEndDate : new Date();
    const endDate = addDays(startDate, plan.durationDays);

    this.logger.log(
      `Stacking: latestEndDate=${latestEndDate?.toISOString() ?? 'null'}, ` +
        `startDate=${startDate.toISOString()}, endDate=${endDate.toISOString()}`,
      'execute',
    );

    const session = await this.stripeService.createCheckoutSession({
      customerId,
      priceId: plan.stripePriceId,
      metadata: {
        userId,
        planId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    });

    this.logger.log(`Checkout session created: ${session.id}`, 'execute');

    return { checkoutUrl: session.url! };
  }

  private async getOrCreateStripeCustomer(userId: string): Promise<string> {
    const existing = await this.repo.findStripeCustomerByUserId(userId);
    if (existing) {
      this.logger.log(
        `Found existing Stripe customer: ${existing.stripeCustomerId}`,
        'getOrCreateStripeCustomer',
      );
      return existing.stripeCustomerId;
    }

    const customer = await this.stripeService.createCustomer(userId);
    await this.repo.createStripeCustomer({
      userId,
      stripeCustomerId: customer.id,
    });
    this.logger.log(`Created new Stripe customer: ${customer.id}`, 'getOrCreateStripeCustomer');
    return customer.id;
  }
}
