import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginationInput } from '../../api/input-dto/pagination.input';
import { FollowsQueryRepository } from '../../../follows/infrastructure/follows.query-repository';
import { FollowsPageType, FollowUserType } from '../../api/view-dto/admin-follow.view-dto';

export class GetUserFollowersQuery {
  constructor(
    public readonly userId: string,
    public readonly pagination: PaginationInput,
  ) {}
}

@QueryHandler(GetUserFollowersQuery)
export class GetUserFollowersQueryHandler implements IQueryHandler<
  GetUserFollowersQuery,
  FollowsPageType
> {
  constructor(private readonly followsQueryRepo: FollowsQueryRepository) {}

  async execute({ userId, pagination }: GetUserFollowersQuery): Promise<FollowsPageType> {
    const { follows, totalCount } = await this.followsQueryRepo.findFollowersPaginated(
      userId,
      pagination,
    );
    return FollowsPageType.mapToView(
      follows.map((f) => FollowUserType.fromFollower(f)),
      totalCount,
      pagination.page,
      pagination.pageSize,
    );
  }
}
