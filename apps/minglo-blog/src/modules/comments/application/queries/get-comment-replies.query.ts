import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { CommentsQueryRepository } from '../../infrastructure/comments.query-repository';
import { CommentsWithCursorViewDto } from '../../api/view-dto';
import { UserQueryRepository } from '../../../user-account/infrastructure/queries';

export class GetCommentRepliesQuery {
  constructor(
    public readonly commentPublicId: string,
    public readonly currentUserPublicId: string,
    public readonly cursor?: string,
  ) {}
}

@QueryHandler(GetCommentRepliesQuery)
export class GetCommentRepliesQueryHandler implements IQueryHandler<
  GetCommentRepliesQuery,
  CommentsWithCursorViewDto
> {
  constructor(
    private readonly commentsQueryRepo: CommentsQueryRepository,
    private readonly userQueryRepo: UserQueryRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(GetCommentRepliesQueryHandler.name);
  }

  async execute({
    commentPublicId,
    currentUserPublicId,
    cursor,
  }: GetCommentRepliesQuery): Promise<CommentsWithCursorViewDto> {
    this.logger.log(`GetCommentReplies commentId=${commentPublicId}`, 'execute');
    const currentUserId = await this.userQueryRepo.findIdByPublicId(currentUserPublicId);
    return this.commentsQueryRepo.findCommentReplies(commentPublicId, currentUserId, cursor);
  }
}
