import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { PaymentsAnalyticsItemViewDto } from '@app/payments/view-dto';
import { PaymentsRepository } from '../../infrastructure';

export class GetPaymentsAnalyticsQuery {
  constructor(
    public readonly dateFrom: string,
    public readonly dateTo: string,
  ) {}
}

@QueryHandler(GetPaymentsAnalyticsQuery)
export class GetPaymentsAnalyticsQueryHandler implements IQueryHandler<
  GetPaymentsAnalyticsQuery,
  PaymentsAnalyticsItemViewDto[]
> {
  constructor(
    private readonly repo: PaymentsRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(GetPaymentsAnalyticsQueryHandler.name);
  }

  async execute({
    dateFrom,
    dateTo,
  }: GetPaymentsAnalyticsQuery): Promise<PaymentsAnalyticsItemViewDto[]> {
    this.logger.log(
      `get_payments_analytics START dateFrom=${dateFrom} dateTo=${dateTo}`,
      'execute',
    );

    const items = await this.repo.countPaidAccountsByDay(dateFrom, dateTo);

    this.logger.log(`get_payments_analytics DONE points=${items.length}`, 'execute');

    return items;
  }
}
