import { Args, Query, Resolver } from '@nestjs/graphql';
import { QueryBus } from '@nestjs/cqrs';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { AnalyticsQueryInput } from '../input-dto/analytics-query.input';
import { AnalyticsResultType } from '../view-dto/analytics-result.view-dto';
import { AnalyticsMetric } from '../enums/analytics-metric.enum';
import { GetAnalyticsQuery } from '../../application/queries';

const PUBLIC_ANALYTICS_WHITELIST: ReadonlySet<AnalyticsMetric> = new Set([
  AnalyticsMetric.NEW_USERS,
]);

@Resolver()
export class PublicAnalyticsResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @Query(() => AnalyticsResultType)
  async publicAnalytics(@Args('query') query: AnalyticsQueryInput): Promise<AnalyticsResultType> {
    if (!PUBLIC_ANALYTICS_WHITELIST.has(query.metric)) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: `Metric "${query.metric}" is not available without authorization`,
      });
    }

    return this.queryBus.execute(new GetAnalyticsQuery(query));
  }
}
