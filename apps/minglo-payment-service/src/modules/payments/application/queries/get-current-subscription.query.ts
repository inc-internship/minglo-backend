import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { SubscriptionInfoViewDto, SubscriptionViewDto } from '@app/payments/view-dto';
import { SubscriptionStatus } from '@app/payments/enums';
import { PaymentsRepository } from '../../infrastructure';

export class GetCurrentSubscriptionQuery {
  constructor(public readonly userId: string) {}
}

@QueryHandler(GetCurrentSubscriptionQuery)
export class GetCurrentSubscriptionQueryHandler implements IQueryHandler<
  GetCurrentSubscriptionQuery,
  SubscriptionInfoViewDto
> {
  constructor(
    private readonly repo: PaymentsRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(GetCurrentSubscriptionQueryHandler.name);
  }

  async execute({ userId }: GetCurrentSubscriptionQuery): Promise<SubscriptionInfoViewDto> {
    this.logger.log(`get_current_subscription START userId=${userId}`, 'execute');

    const subscriptions = await this.repo.findCurrentSubscriptions(userId);

    const activeSubscription = subscriptions.find(
      (s) => (s.status as SubscriptionStatus) === SubscriptionStatus.ACTIVE,
    );
    // Last in the stack (highest endDate) — used for nextPaymentDate
    const lastSubscription =
      subscriptions.length > 0 ? subscriptions[subscriptions.length - 1] : null;

    const expiresAt = activeSubscription?.endDate?.toISOString() ?? null;
    const nextPaymentDate = lastSubscription?.autoRenewal
      ? (lastSubscription?.endDate?.toISOString() ?? null)
      : null;

    const items: SubscriptionViewDto[] = subscriptions.map((s) => ({
      id: s.id,
      planName: s.plan.name,
      price: Number(s.plan.price).toFixed(2),
      status: s.status,
      startDate: s.startDate?.toISOString() ?? null,
      endDate: s.endDate?.toISOString() ?? null,
      autoRenewal: s.autoRenewal,
    }));

    this.logger.log(`get_current_subscription DONE subs=${subscriptions.length}`, 'execute');

    return { expiresAt, nextPaymentDate, subscriptions: items };
  }
}
