import { Injectable } from '@nestjs/common';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import {
  Payment,
  Plan,
  StripeCustomer,
  Subscription,
} from 'apps/minglo-payment-service/prisma/generated/prisma';
import { SubscriptionStatus } from '@app/payments/enums';
import { PrismaPaymentService } from '../../../database';
import { ICreatePaymentData, ICreateSubscriptionData } from '../application/interfaces';

@Injectable()
export class PaymentsRepository {
  constructor(private readonly prisma: PrismaPaymentService) {}

  // Returns stripePriceId and selected plan durationDays
  async findPlanByIdOrFail(id: string): Promise<Plan> {
    const plan = await this.prisma.plan.findUnique({ where: { id } });
    if (!plan) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `Plan with id "${id}" not found`,
      });
    }
    return plan;
  }

  // Returns existing stripe customer if exists
  async findStripeCustomerByUserId(userId: string): Promise<StripeCustomer | null> {
    return this.prisma.stripeCustomer.findUnique({ where: { userId } });
  }

  // Creates new Stripe customer.
  async createStripeCustomer(data: {
    userId: string;
    stripeCustomerId: string;
  }): Promise<StripeCustomer> {
    return this.prisma.stripeCustomer.create({ data });
  }

  /**
   * Returns the latest subscription end date from ACTIVE and PENDING subscriptions.
   * If none exists, it returns null (the first subscription starts immediately).
   * Otherwise, the next subscription starts after the latest end date.
   */
  async findLatestEndDate(userId: string): Promise<Date | null> {
    const result = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PENDING] },
        endDate: { not: null },
      },
      orderBy: { endDate: 'desc' },
      select: { endDate: true },
    });
    return result?.endDate ?? null;
  }

  // Deactivates auto-renewal in all user's subscriptions before new one (only one subscription must have auto-renewal).
  async disableAutoRenewalForUser(userId: string): Promise<void> {
    await this.prisma.subscription.updateMany({
      where: { userId, autoRenewal: true },
      data: { autoRenewal: false },
    });
  }

  // Creates new subscription
  async createSubscription(data: ICreateSubscriptionData): Promise<Subscription> {
    return this.prisma.subscription.create({ data });
  }

  // Creates Payment record in db
  async createPayment(data: ICreatePaymentData): Promise<Payment> {
    return this.prisma.payment.create({ data });
  }
}
