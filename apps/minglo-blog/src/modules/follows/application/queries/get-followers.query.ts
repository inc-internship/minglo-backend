import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { FollowsQueryRepository } from '../../infrastructure/follows.query-repository';
import { FollowsWithCursorViewDto } from '../../api/view-dto';

export class GetFollowersQuery {
  constructor(
    public readonly userId: string,
    public readonly cursor?: string,
  ) {}
}

@QueryHandler(GetFollowersQuery)
export class GetFollowersQueryHandler implements IQueryHandler<
  GetFollowersQuery,
  FollowsWithCursorViewDto
> {
  constructor(
    private readonly followsQueryRepo: FollowsQueryRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(GetFollowersQueryHandler.name);
  }

  async execute({ userId, cursor }: GetFollowersQuery): Promise<FollowsWithCursorViewDto> {
    this.logger.log(`GetFollowers userId=${userId}`, 'execute');
    return this.followsQueryRepo.findFollowers(userId, cursor);
  }
}
