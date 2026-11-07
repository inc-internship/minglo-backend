import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventBus } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { PaymentStatus, PaymentSystem, SubscriptionStatus } from '@app/payments/enums';
import { PaymentsRepository } from '../../infrastructure';
import { StripeService } from '../../../stripe/stripe.service';
import { SubscriptionActivatedEvent } from '../events';

@Injectable()
export class SubscriptionsJob {
  constructor(
    private readonly repo: PaymentsRepository,
    private readonly stripeService: StripeService,
    private readonly eventBus: EventBus,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(SubscriptionsJob.name);
  }

  /**
   * 1. Expire ACTIVE subscriptions whose endDate has passed.
   *    - If autoRenewal=true and no PENDING next sub → attempt off-session charge.
   * 2. Activate PENDING subscriptions whose startDate has arrived.
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async run(): Promise<void> {
    this.logger.log('Subscription cron START', 'run');

    await this.expireAndRenew();
    await this.activatePending();

    this.logger.log('Subscription cron DONE', 'run');
  }

  private async expireAndRenew(): Promise<void> {
    const expired = await this.repo.findActiveSubscriptionsToExpire();
    if (expired.length === 0) return;

    this.logger.log(`Found ${expired.length} ACTIVE subscriptions to expire`, 'expireAndRenew');

    for (const sub of expired) {
      // Check if there's a PENDING subscription already purchased by user
      const nextPending = await this.repo.findPendingSubscriptionForUser(sub.userId);

      if (nextPending) {
        // Stacking: just expire the current one; the pending one will be activated in activatePending()
        await this.repo.expireSubscription(sub.id);
        this.logger.log(
          `Expired subscription ${sub.id} (next PENDING ${nextPending.id} found)`,
          'expireAndRenew',
        );
        continue;
      }

      if (sub.autoRenewal && sub.stripePaymentMethodId && sub.stripeCustomerId) {
        await this.processAutoRenewal(
          sub as typeof sub & {
            plan: { price: any; currency: string; durationDays: number; name: string };
          },
        );
      } else {
        // No auto-renewal: just expire
        await this.repo.expireSubscription(sub.id);
        this.logger.log(`Expired subscription ${sub.id} (no auto-renewal)`, 'expireAndRenew');
      }
    }
  }

  private async processAutoRenewal(sub: any): Promise<void> {
    this.logger.log(
      `Auto-renewal START for subscription ${sub.id} userId=${sub.userId}`,
      'processAutoRenewal',
    );

    const startDate = sub.endDate!; // new period starts where old one ended
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + sub.plan.durationDays);

    const amountCents = Math.round(Number(sub.plan.price) * 100);

    try {
      const paymentIntent = await this.stripeService.createOffSessionPayment({
        amountCents,
        currency: sub.plan.currency,
        customerId: sub.stripeCustomerId!,
        paymentMethodId: sub.stripePaymentMethodId!,
        metadata: {
          userId: sub.userId,
          planId: sub.planId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          autoRenewal: 'true',
        },
      });

      // Expire the old subscription
      await this.repo.expireSubscription(sub.id);

      // Create new subscription
      const newSub = await this.repo.createSubscription({
        userId: sub.userId,
        planId: sub.planId,
        status: SubscriptionStatus.ACTIVE,
        paymentSystem: PaymentSystem.STRIPE,
        startDate,
        endDate,
        autoRenewal: true,
        stripePaymentMethodId: sub.stripePaymentMethodId!,
        stripeCustomerId: sub.stripeCustomerId!,
      });

      // Record payment
      await this.repo.createPayment({
        userId: sub.userId,
        subscriptionId: newSub.id,
        amount: Number(sub.plan.price),
        currency: sub.plan.currency.toUpperCase(),
        status: PaymentStatus.SUCCESS,
        paymentSystem: PaymentSystem.STRIPE,
        externalPaymentId: paymentIntent.id,
        rawProviderData: paymentIntent as unknown as Record<string, unknown>,
      });

      // Notify blog-service via RabbitMQ
      this.eventBus.publish(new SubscriptionActivatedEvent(sub.userId, endDate));

      this.logger.log(
        `Auto-renewal SUCCESS for userId=${sub.userId} newSub=${newSub.id}`,
        'processAutoRenewal',
      );
    } catch (err: any) {
      this.logger.error(
        `Auto-renewal FAILED for subscription ${sub.id} userId=${sub.userId}: ${err?.message}`,
        'processAutoRenewal',
      );

      // Expire the subscription and disable auto-renewal so we don't keep retrying
      await this.repo.expireSubscription(sub.id);
      await this.repo.setAutoRenewal(sub.userId, false);

      // Record failed payment (best-effort, no externalPaymentId)
      try {
        await this.repo.createPayment({
          userId: sub.userId,
          subscriptionId: sub.id,
          amount: Number(sub.plan.price),
          currency: sub.plan.currency.toUpperCase(),
          status: PaymentStatus.FAILED,
          paymentSystem: PaymentSystem.STRIPE,
          externalPaymentId: `failed_renewal_${sub.id}_${Date.now()}`,
          rawProviderData: { error: err?.message },
          failureReason: err?.message ?? 'Auto-renewal payment failed',
        });
      } catch (paymentErr: any) {
        this.logger.error(
          `Failed to record failed payment for sub ${sub.id}: ${paymentErr?.message}`,
          'processAutoRenewal',
        );
      }
    }
  }

  private async activatePending(): Promise<void> {
    const toActivate = await this.repo.findPendingSubscriptionsToActivate();
    if (toActivate.length === 0) return;

    this.logger.log(
      `Found ${toActivate.length} PENDING subscriptions to activate`,
      'activatePending',
    );

    for (const sub of toActivate) {
      const activated = await this.repo.activateSubscription(sub.id);
      this.logger.log(
        `Activated subscription ${sub.id} for userId=${sub.userId}`,
        'activatePending',
      );

      this.eventBus.publish(new SubscriptionActivatedEvent(sub.userId, activated.endDate!));
    }
  }
}
