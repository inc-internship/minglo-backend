import { IQueryHandler, QueryHandler, QueryBus } from '@nestjs/cqrs';
import { AnalyticsQueryInput } from '../../api/input-dto/analytics-query.input';
import { AnalyticsMetric } from '../../api/enums/analytics-metric.enum';
import { AnalyticsRawPoint, AnalyticsResultType } from '../../api/view-dto/analytics-result.view-dto';
import { AdminQueryRepository } from '../../infrastructure/admin.query-repository';
import { GetPaymentsAnalyticsTcpQuery } from '../../../billing/application/queries/get-payments-analytics-tcp.query';

export class GetAnalyticsQuery {
  constructor(public readonly input: AnalyticsQueryInput) {}
}

@QueryHandler(GetAnalyticsQuery)
export class GetAnalyticsQueryHandler implements IQueryHandler<GetAnalyticsQuery, AnalyticsResultType> {
  constructor(
    private readonly adminQueryRepo: AdminQueryRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute({ input }: GetAnalyticsQuery): Promise<AnalyticsResultType> {
    const { metric, dateFrom, dateTo } = input;

    const { previousFrom, previousTo } = this.calculatePreviousRange(dateFrom, dateTo);

    const [currentRaw, previousRaw] = await Promise.all([
      this.fetchRawData(metric, dateFrom, dateTo),
      this.fetchRawData(metric, previousFrom, previousTo),
    ]);

    return AnalyticsResultType.mapToView(
      currentRaw,
      previousRaw,
      dateFrom,
      dateTo,
      previousFrom,
      previousTo,
    );
  }

  private fetchRawData(
    metric: AnalyticsMetric,
    dateFrom: string,
    dateTo: string,
  ): Promise<AnalyticsRawPoint[]> {
    switch (metric) {
      case AnalyticsMetric.NEW_USERS:
        return this.adminQueryRepo.countNewUsersByDay(dateFrom, dateTo);
      case AnalyticsMetric.UPLOADED_PHOTOS_SIZE:
        return this.adminQueryRepo.sumUploadedPhotosSizeByDay(dateFrom, dateTo);
      case AnalyticsMetric.PAID_ACCOUNTS:
        return this.queryBus.execute(new GetPaymentsAnalyticsTcpQuery(dateFrom, dateTo));
    }
  }

  private calculatePreviousRange(
    dateFrom: string,
    dateTo: string,
  ): { previousFrom: string; previousTo: string } {
    const from = new Date(`${dateFrom}T00:00:00.000Z`);
    const to = new Date(`${dateTo}T00:00:00.000Z`);

    if (this.isFullCalendarMonth(from, to)) {
      const previousMonthFrom = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() - 1, 1));
      const previousMonthTo = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), 0));

      return {
        previousFrom: previousMonthFrom.toISOString().slice(0, 10),
        previousTo: previousMonthTo.toISOString().slice(0, 10),
      };
    }

    const durationDays = Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const previousTo = new Date(from);
    previousTo.setUTCDate(previousTo.getUTCDate() - 1);

    const previousFrom = new Date(previousTo);
    previousFrom.setUTCDate(previousFrom.getUTCDate() - (durationDays - 1));

    return {
      previousFrom: previousFrom.toISOString().slice(0, 10),
      previousTo: previousTo.toISOString().slice(0, 10),
    };
  }

  private isFullCalendarMonth(from: Date, to: Date): boolean {
    const isSameMonth =
      from.getUTCFullYear() === to.getUTCFullYear() && from.getUTCMonth() === to.getUTCMonth();
    const isFirstDay = from.getUTCDate() === 1;
    const lastDayOfMonth = new Date(
      Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + 1, 0),
    ).getUTCDate();
    const isLastDay = to.getUTCDate() === lastDayOfMonth;

    return isSameMonth && isFirstDay && isLastDay;
  }
}
