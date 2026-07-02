import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { PaginationInput } from '../../api/input-dto/pagination.input';
import { FollowsQueryRepository } from '../../../follows/infrastructure/follows.query-repository';
import { FollowsPageType } from '../../api/view-dto/admin-follow.view-dto';

export class GetUserFollowersQuery {
  constructor(
    public readonly userId: string,
    public readonly pagination: PaginationInput,
  ) {}
}

export class FollowUserItem {
  userId: string;
  username: string;
  avatarUrl: string | null;
}

export class FollowsPageResult {
  items: FollowUserItem[];
  totalCount: number;
  pagesCount: number;
  page: number;
}

@QueryHandler(GetUserFollowersQuery)
export class GetUserFollowersQueryHandler implements IQueryHandler<
  GetUserFollowersQuery,
  FollowsPageResult
> {
  constructor(
    private readonly followsQueryRepo: FollowsQueryRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(GetUserFollowersQueryHandler.name);
  }

  async execute({ userId, pagination }: GetUserFollowersQuery) {
    const { follows, totalCount } = await this.followsQueryRepo.findFollowersPaginated(
      userId,
      pagination,
    );
    return FollowsPageType.fromFollowers(follows, totalCount, pagination.page, pagination.pageSize);
  }
}
