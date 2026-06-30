import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { CommentsQueryRepository } from '../../infrastructure/comments.query-repository';
import { CommentsWithCursorViewDto } from '../../api/view-dto';
import { UserQueryRepository } from '../../../user-account/infrastructure/queries';

export class GetPostCommentsQuery {
  constructor(
    public readonly postPublicId: string,
    public readonly currentUserPublicId: string,
    public readonly cursor?: string,
  ) {}
}

@QueryHandler(GetPostCommentsQuery)
export class GetPostCommentsQueryHandler implements IQueryHandler<
  GetPostCommentsQuery,
  CommentsWithCursorViewDto
> {
  constructor(
    private readonly commentsQueryRepo: CommentsQueryRepository,
    private readonly userQueryRepo: UserQueryRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(GetPostCommentsQueryHandler.name);
  }

  async execute({
    postPublicId,
    currentUserPublicId,
    cursor,
  }: GetPostCommentsQuery): Promise<CommentsWithCursorViewDto> {
    this.logger.log(`GetPostComments postId=${postPublicId}`, 'execute');
    const currentUserId = await this.userQueryRepo.findIdByPublicId(currentUserPublicId);
    return this.commentsQueryRepo.findPostComments(postPublicId, currentUserId, cursor);
  }
}
