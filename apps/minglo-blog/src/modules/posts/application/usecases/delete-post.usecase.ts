import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { DomainException, DomainExceptionCode } from '@app/exceptions';

export class DeletePostCommand {
  constructor(
    public readonly postPublicId: string,
    public readonly userPublicId: string,
  ) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand, void> {
  constructor(
    private readonly repo: PostsRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(DeletePostUseCase.name);
  }

  async execute({ postPublicId, userPublicId }: DeletePostCommand): Promise<void> {
    this.logger.log('DeletePostUseCase started', 'execute');

    const post = await this.repo.findForUpdate(postPublicId);

    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
        extensions: [{ field: 'postId', message: 'Post not found' }],
      });
    }

    this.logger.log('Post loaded for deletion', 'execute');

    if (post.user.publicId !== userPublicId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'You are not allowed to delete this post',
      });
    }

    await this.repo.softDelete(post.id);

    this.logger.log('Post successfully deleted', 'execute');
  }
}
