import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { UserQueryRepository } from '../../../user-account/infrastructure/queries';

export class DeleteCommentCommand {
  constructor(
    public readonly commentPublicId: string,
    public readonly authorPublicId: string,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase implements ICommandHandler<DeleteCommentCommand, void> {
  constructor(
    private readonly commentsRepo: CommentsRepository,
    private readonly userQueryRepo: UserQueryRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(DeleteCommentUseCase.name);
  }

  async execute({ commentPublicId, authorPublicId }: DeleteCommentCommand): Promise<void> {
    this.logger.log(`DeleteComment commentId=${commentPublicId}`, 'execute');

    const comment = await this.commentsRepo.findByPublicId(commentPublicId);

    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment not found',
        extensions: [{ field: 'commentId', message: 'Comment not found' }],
      });
    }

    const authorId = await this.userQueryRepo.findIdByPublicId(authorPublicId);

    if (comment.authorId !== authorId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'You can only delete your own comments',
        extensions: [{ field: 'commentId', message: 'Access denied' }],
      });
    }

    await this.commentsRepo.softDelete(comment.id);
  }
}