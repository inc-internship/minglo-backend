import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginationInput } from '../../api/input-dto/pagination.input';
import { FollowsQueryRepository } from '../../../follows/infrastructure/follows.query-repository';
import { FollowsPageType, FollowUserType } from '../../api/view-dto/admin-follow.view-dto';

export class GetUserFollowingQuery {
  constructor(
    public readonly userId: string,
    public readonly pagination: PaginationInput,
  ) {}
}

@QueryHandler(GetUserFollowingQuery)
export class GetUserFollowingQueryHandler implements IQueryHandler<
  GetUserFollowingQuery,
  FollowsPageType
> {
  constructor(private readonly followsQueryRepo: FollowsQueryRepository) {}

  async execute({ userId, pagination }: GetUserFollowingQuery): Promise<FollowsPageType> {
    const { follows, totalCount } = await this.followsQueryRepo.findFollowingPaginated(
      userId,
      pagination,
    );
    return FollowsPageType.mapToView(
      follows.map((f) => FollowUserType.fromFollowing(f)),
      totalCount,
      pagination.page,
      pagination.pageSize,
    );
  }
}
