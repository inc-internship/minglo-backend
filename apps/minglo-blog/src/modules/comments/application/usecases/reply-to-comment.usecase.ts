import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { CommentEntity } from '../../domains/entities/comment.entity';
import { UserQueryRepository } from '../../../user-account/infrastructure/queries';

export class ReplyToCommentCommand {
  constructor(
    public readonly postPublicId: string,
    public readonly parentCommentPublicId: string,
    public readonly authorPublicId: string,
    public readonly text: string,
  ) {}
}

@CommandHandler(ReplyToCommentCommand)
export class ReplyToCommentUseCase implements ICommandHandler<ReplyToCommentCommand, string> {
  constructor(
    private readonly commentsRepo: CommentsRepository,
    private readonly userQueryRepo: UserQueryRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(ReplyToCommentUseCase.name);
  }

  async execute({
    postPublicId,
    parentCommentPublicId,
    authorPublicId,
    text,
  }: ReplyToCommentCommand): Promise<string> {
    this.logger.log(`ReplyToComment parentId=${parentCommentPublicId}`, 'execute');

    const parentComment = await this.commentsRepo.findByPublicId(parentCommentPublicId);

    if (!parentComment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment not found',
        extensions: [{ field: 'commentId', message: 'Comment not found' }],
      });
    }

    if (parentComment.parentCommentId !== null) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Cannot reply to a reply',
        extensions: [{ field: 'commentId', message: 'Replies can only be one level deep' }],
      });
    }

    const authorId = await this.userQueryRepo.findIdByPublicId(authorPublicId);
    const comment = CommentEntity.create({
      postId: parentComment.postId,
      authorId,
      text,
      parentCommentId: parentComment.id,
    });

    const publicId = await this.commentsRepo.create(comment);
    await this.commentsRepo.incrementRepliesCount(parentComment.id);

    return publicId;
  }
}
