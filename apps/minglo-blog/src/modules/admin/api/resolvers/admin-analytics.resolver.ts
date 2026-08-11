import { Args, Query, Resolver } from '@nestjs/graphql';
import { QueryBus } from '@nestjs/cqrs';
import { UseGuards } from '@nestjs/common';
import { AdminBasicAuthGuard } from '../../guards/admin-basic-auth.guard';
import { AnalyticsQueryInput } from '../input-dto/analytics-query.input';
import { AnalyticsResultType } from '../view-dto/analytics-result.view-dto';
import { GetAnalyticsQuery } from '../../application/queries';

@UseGuards(AdminBasicAuthGuard)
@Resolver()
export class AdminAnalyticsResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @Query(() => AnalyticsResultType)
  async analytics(@Args('query') query: AnalyticsQueryInput): Promise<AnalyticsResultType> {
    return this.queryBus.execute(new GetAnalyticsQuery(query));
  }
}
