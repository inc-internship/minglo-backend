import { Args, Query, Resolver } from '@nestjs/graphql';
import { QueryBus } from '@nestjs/cqrs';
import {
  GetUserDetailQuery,
  GetUserFollowersQuery,
  GetUserFollowingQuery,
} from '../../application/queries';
import { UseGuards } from '@nestjs/common';
import { AdminBasicAuthGuard } from '../../guards/admin-basic-auth.guard';
import { PaginationInput } from '../input-dto';
import { GetPaymentHistoryQuery } from '../../../billing/application/queries/get-payment-history.query';
import { AdminUserDetailType, PaymentsPageType, FollowsPageType } from '../view-dto';

@UseGuards(AdminBasicAuthGuard)
@Resolver()
export class AdminUserDetailResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @Query(() => AdminUserDetailType)
  async user(@Args('publicId') publicId: string): Promise<AdminUserDetailType> {
    return this.queryBus.execute(new GetUserDetailQuery(publicId));
  }

  @Query(() => PaymentsPageType)
  async userPayments(
    @Args('publicId') publicId: string,
    @Args('pagination', { defaultValue: {} }) pagination: PaginationInput,
  ) {
    return this.queryBus.execute(
      new GetPaymentHistoryQuery(publicId, pagination.page, pagination.pageSize),
    );
  }

  @Query(() => FollowsPageType)
  async userFollowers(
    @Args('publicId') publicId: string,
    @Args('pagination', { defaultValue: {} }) pagination: PaginationInput,
  ): Promise<FollowsPageType> {
    return this.queryBus.execute(new GetUserFollowersQuery(publicId, pagination));
  }

  @Query(() => FollowsPageType)
  async userFollowing(
    @Args('publicId') publicId: string,
    @Args('pagination', { defaultValue: {} }) pagination: PaginationInput,
  ): Promise<FollowsPageType> {
    return this.queryBus.execute(new GetUserFollowingQuery(publicId, pagination));
  }
}
