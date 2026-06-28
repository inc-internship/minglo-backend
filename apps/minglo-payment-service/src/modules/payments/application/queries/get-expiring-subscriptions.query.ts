import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { ExpiringSubscriptionDto } from '@app/payments';
import { addDays } from 'date-fns';
import { PaymentsRepository } from '../../infrastructure';

export class GetExpiringSubscriptionsQuery {
  constructor(public readonly days: number) {}
}

@QueryHandler(GetExpiringSubscriptionsQuery)
export class GetExpiringSubscriptionsQueryHandler implements IQueryHandler<
  GetExpiringSubscriptionsQuery,
  ExpiringSubscriptionDto[]
> {
  constructor(
    private readonly repo: PaymentsRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(GetExpiringSubscriptionsQueryHandler.name);
  }

  async execute({ days }: GetExpiringSubscriptionsQuery): Promise<ExpiringSubscriptionDto[]> {
    this.logger.log(`get_expiring_subscriptions START days=${days}`, 'execute');

    const targetDate = addDays(new Date(), days);
    const results = await this.repo.findExpiringSubscriptions(targetDate);

    this.logger.log(`get_expiring_subscriptions DONE count=${results.length}`, 'execute');

    return results.map((s) => ({
      userId: s.userId,
      expiresAt: s.endDate.toISOString(),
      autoRenewal: s.autoRenewal,
    }));
  }
}
