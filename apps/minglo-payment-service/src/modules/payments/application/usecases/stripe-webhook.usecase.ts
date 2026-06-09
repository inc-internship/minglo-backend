import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { PaymentStatus, PaymentSystem, SubscriptionStatus } from '@app/payments/enums';
import { PaymentsRepository } from '../../infrastructure';
import { StripeService } from '../../../stripe/stripe.service';
import { SubscriptionActivatedEvent } from '../events';

export interface PaymentSessionMeta {
  userId: string;
  planId: string;
  startDate: string;
  endDate: string;
}

export class StripeWebhookCommand {
  constructor(
    public readonly rawBody: Buffer,
    public readonly signature: string,
  ) {}
}

@CommandHandler(StripeWebhookCommand)
export class StripeWebhookUseCase implements ICommandHandler<StripeWebhookCommand, void> {
  constructor(
    private readonly repo: PaymentsRepository,
    private readonly stripeService: StripeService,
    private readonly eventBus: EventBus,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(StripeWebhookUseCase.name);
  }

  async execute({ rawBody, signature }: StripeWebhookCommand): Promise<void> {
    // Verify Stripe signature
    const event = this.stripeService.constructWebhookEvent(rawBody, signature);

    this.logger.log(`Webhook received: ${event.type}, id=${event.id}`, 'execute');

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as any);
        break;

      case 'payment_intent.payment_failed':
        this.logger.warn(
          `payment_intent.payment_failed: ${(event.data.object as any).id}. Skipping for now (BE-12).`,
          'execute',
        );
        break;

      default:
        this.logger.log(`Unhandled event type: ${event.type}`, 'execute');
    }
  }

  private async handleCheckoutCompleted(session: any): Promise<void> {
    const { userId, planId, startDate, endDate } = session.metadata as PaymentSessionMeta;

    const paymentIntentId = session.payment_intent as string;
    const customerId = session.customer as string;

    this.logger.log(
      `checkout.session.completed: userId=${userId}, paymentIntentId=${paymentIntentId}`,
      'handleCheckoutCompleted',
    );

    const paymentIntent = await this.stripeService.getPaymentIntent(paymentIntentId);
    const paymentMethodId = (paymentIntent.payment_method as any)?.id as string;

    // disable autoRenewal for all previous subscriptions.
    await this.repo.disableAutoRenewalForUser(userId);

    // startDate from metadata Stripe (in CreateStripeCheckoutUseCase).
    // ACTIVE -> for first payment | PENDING for stacking.
    const start = new Date(startDate);
    const status = start <= new Date() ? SubscriptionStatus.ACTIVE : SubscriptionStatus.PENDING;

    const subscription = await this.repo.createSubscription({
      userId,
      planId,
      status,
      paymentSystem: PaymentSystem.STRIPE,
      startDate: start,
      endDate: new Date(endDate),
      autoRenewal: true,
      stripePaymentMethodId: paymentMethodId,
      stripeCustomerId: customerId,
    });

    this.logger.log(
      `Subscription created: ${subscription.id}, status=${status}`,
      'handleCheckoutCompleted',
    );

    try {
      await this.repo.createPayment({
        userId,
        subscriptionId: subscription.id,
        amount: session.amount_total! / 100, // amount_total in minors units (cents).
        currency: (session.currency as string).toUpperCase(),
        status: PaymentStatus.SUCCESS,
        paymentSystem: PaymentSystem.STRIPE,
        externalPaymentId: paymentIntentId,
        rawProviderData: paymentIntent as unknown as Record<string, unknown>, // save raw data for future use.
      });
    } catch (err: any) {
      // Ignore Stripe duplicates.
      if (err?.code === 'P2002') {
        this.logger.warn(
          `Duplicate webhook for paymentIntentId=${paymentIntentId}, skipping.`,
          'handleCheckoutCompleted',
        );
        return;
      }
      throw err;
    }

    // Publicates event only for ACTIVE subscriptions.
    // If PENDING -> user has not finished ACTIVE subscription (stacking)
    if (status === SubscriptionStatus.ACTIVE) {
      this.eventBus.publish(new SubscriptionActivatedEvent(userId, new Date(endDate)));

      this.logger.log(
        `SubscriptionActivatedDomainEvent published for userId=${userId}`,
        'handleCheckoutCompleted',
      );
    }
  }
}
