import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { PostQueryRepository } from '../../infrastructure/query';
import { FeedPostsWithCursorViewDto } from '../../api/view-dto';

export class GetFeedQuery {
  constructor(
    public readonly currentUserPublicId: string,
    public readonly cursor?: string,
  ) {}
}

@QueryHandler(GetFeedQuery)
export class GetFeedQueryHandler implements IQueryHandler<
  GetFeedQuery,
  FeedPostsWithCursorViewDto
> {
  constructor(
    private readonly postsQueryRepo: PostQueryRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(GetFeedQueryHandler.name);
  }

  async execute({
    currentUserPublicId,
    cursor,
  }: GetFeedQuery): Promise<FeedPostsWithCursorViewDto> {
    this.logger.log(`GetFeed user=${currentUserPublicId}`, 'execute');
    return this.postsQueryRepo.findFeed(currentUserPublicId, cursor);
  }
}
