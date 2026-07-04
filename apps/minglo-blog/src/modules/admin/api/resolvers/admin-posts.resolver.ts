import { Args, Query, Resolver, Subscription } from '@nestjs/graphql';
import { Inject, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { PubSub } from 'graphql-subscriptions';
import { PUB_SUB } from '../../../../core/pubsub.module';
import { AdminBasicAuthGuard } from '../../guards/admin-basic-auth.guard';
import { AdminPostType, AdminPostsPageType } from '../view-dto';
import { PostsQueryInput } from '../input-dto';
import { GetAllPostsQuery } from '../../application/queries';
import { POST_ADDED_EVENT } from '../../constants';

@UseGuards(AdminBasicAuthGuard)
@Resolver(() => AdminPostType)
export class AdminPostsResolver {
  constructor(
    private readonly queryBus: QueryBus,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  @Query(() => AdminPostsPageType)
  async posts(@Args('query') query: PostsQueryInput): Promise<AdminPostsPageType> {
    return this.queryBus.execute(new GetAllPostsQuery(query));
  }

  @Subscription(() => AdminPostType, { name: POST_ADDED_EVENT })
  postAdded() {
    return this.pubSub.asyncIterableIterator(POST_ADDED_EVENT);
  }
}
