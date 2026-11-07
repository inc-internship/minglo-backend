import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { FollowsQueryRepository } from '../../infrastructure/follows.query-repository';
import { FollowsWithCursorViewDto } from '../../api/view-dto';

export class GetFollowingQuery {
  constructor(
    public readonly userId: string,
    public readonly cursor?: string,
  ) {}
}

@QueryHandler(GetFollowingQuery)
export class GetFollowingQueryHandler implements IQueryHandler<
  GetFollowingQuery,
  FollowsWithCursorViewDto
> {
  constructor(
    private readonly followsQueryRepo: FollowsQueryRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(GetFollowingQueryHandler.name);
  }

  async execute({ userId, cursor }: GetFollowingQuery): Promise<FollowsWithCursorViewDto> {
    this.logger.log(`GetFollowing userId=${userId}`, 'execute');
    return this.followsQueryRepo.findFollowing(userId, cursor);
  }
}
