import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { LikesQueryRepository } from '../../infrastructure/likes.query-repository';
import { PostLikesWithCursorViewDto } from '../../api/view-dto';

export class GetPostLikesQuery {
  constructor(
    public readonly postId: string,
    public readonly cursor?: string,
  ) {}
}

@QueryHandler(GetPostLikesQuery)
export class GetPostLikesQueryHandler implements IQueryHandler<
  GetPostLikesQuery,
  PostLikesWithCursorViewDto
> {
  constructor(
    private readonly likesQueryRepo: LikesQueryRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(GetPostLikesQueryHandler.name);
  }

  async execute({ postId, cursor }: GetPostLikesQuery): Promise<PostLikesWithCursorViewDto> {
    this.logger.log(`GetPostLikes postId=${postId}`, 'execute');
    return this.likesQueryRepo.findPostLikes(postId, cursor);
  }
}
