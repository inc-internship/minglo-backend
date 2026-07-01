import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { FollowsPageResult } from './get-user-followers.query';
import { PaginationInput } from '../../api/input-dto/pagination.input';
import { FollowsQueryRepository } from '../../../follows/infrastructure/follows.query-repository';
import { FollowsPageType } from '../../api/view-dto/admin-follow.view-dto';

export class GetUserFollowingQuery {
  constructor(
    public readonly userId: string,
    public readonly pagination: PaginationInput,
  ) {}
}

@QueryHandler(GetUserFollowingQuery)
export class GetUserFollowingQueryHandler implements IQueryHandler<
  GetUserFollowingQuery,
  FollowsPageResult
> {
  constructor(
    private readonly followsQueryRepo: FollowsQueryRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(GetUserFollowingQueryHandler.name);
  }

  async execute({ userId, pagination }: GetUserFollowingQuery) {
    const { follows, totalCount } = await this.followsQueryRepo.findFollowingPaginated(
      userId,
      pagination,
    );
    return FollowsPageType.fromFollowing(follows, totalCount, pagination.page, pagination.pageSize);
  }
}
