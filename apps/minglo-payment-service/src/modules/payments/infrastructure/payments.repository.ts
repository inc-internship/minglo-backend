import { Injectable } from '@nestjs/common';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import {
  Payment,
  Plan,
  StripeCustomer,
  Subscription,
} from '../../../../prisma/generated/prisma/client';
import { SubscriptionStatus } from '@app/payments/enums';
import { PrismaPaymentService } from '../../../database';
import { ICreatePaymentData, ICreateSubscriptionData } from '../application/interfaces';

type SubscriptionWithPlan = Subscription & { plan: Plan };

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

  async findPaymentHistory(
    userId: string,
    page: number,
    pageSize: number,
  ): Promise<{
    payments: (Payment & { subscription: SubscriptionWithPlan })[];
    totalCount: number;
  }> {
    const skip = (page - 1) * pageSize;
    const [payments, totalCount] = await this.prisma.$transaction([
      this.prisma.payment.findMany({
        where: { userId },
        include: {
          subscription: {
            include: {
              plan: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: pageSize,
      }),
      this.prisma.payment.count({ where: { userId } }),
    ]);
    return {
      payments: payments as (Payment & { subscription: SubscriptionWithPlan })[],
      totalCount,
    };
  }

  async findCurrentSubscriptions(userId: string): Promise<SubscriptionWithPlan[]> {
    return this.prisma.subscription.findMany({
      where: {
        userId,
        status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PENDING] },
      },
      include: { plan: true },
      orderBy: { startDate: 'asc' },
    }) as Promise<SubscriptionWithPlan[]>;
  }

  async setAutoRenewal(userId: string, autoRenewal: boolean): Promise<void> {
    if (!autoRenewal) {
      await this.prisma.subscription.updateMany({
        where: { userId, autoRenewal: true },
        data: { autoRenewal: false },
      });
      return;
    }
    // Enable auto-renewal on the latest ACTIVE or PENDING subscription
    const latest = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PENDING] },
      },
      orderBy: { endDate: 'desc' },
    });
    if (latest) {
      await this.prisma.subscription.update({
        where: { id: latest.id },
        data: { autoRenewal: true },
      });
    }
  }

  /** ACTIVE subscriptions whose endDate has passed — candidates for expiry/renewal */
  async findActiveSubscriptionsToExpire(): Promise<SubscriptionWithPlan[]> {
    return this.prisma.subscription.findMany({
      where: {
        status: SubscriptionStatus.ACTIVE,
        endDate: { lte: new Date() },
      },
      include: { plan: true },
    }) as Promise<SubscriptionWithPlan[]>;
  }

  /** First PENDING subscription for a user (there should be at most one) */
  async findPendingSubscriptionForUser(userId: string): Promise<Subscription | null> {
    return this.prisma.subscription.findFirst({
      where: { userId, status: SubscriptionStatus.PENDING },
      orderBy: { startDate: 'asc' },
    });
  }

  async expireSubscription(id: string): Promise<void> {
    await this.prisma.subscription.update({
      where: { id },
      data: { status: SubscriptionStatus.EXPIRED },
    });
  }

  /** PENDING subscriptions whose startDate has arrived */
  async findPendingSubscriptionsToActivate(): Promise<Subscription[]> {
    return this.prisma.subscription.findMany({
      where: {
        status: SubscriptionStatus.PENDING,
        startDate: { lte: new Date() },
      },
    });
  }

  async activateSubscription(id: string): Promise<Subscription> {
    return this.prisma.subscription.update({
      where: { id },
      data: { status: SubscriptionStatus.ACTIVE },
    });
  }
}
