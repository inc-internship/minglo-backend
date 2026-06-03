import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { DomainException, DomainExceptionCode } from '@app/exceptions';

export class UpdatePostCommand {
  constructor(
    public readonly postPublicId: string,
    public readonly userPublicId: string,
    public readonly description: string | null,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    private readonly repo: PostsRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(UpdatePostUseCase.name);
  }

  async execute({ postPublicId, userPublicId, description }: UpdatePostCommand): Promise<void> {
    this.logger.log('UpdatePostUseCase started', 'execute');

    const post = await this.repo.findForUpdate(postPublicId);

    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
        extensions: [{ field: 'postId', message: 'Post not found' }],
      });
    }

    this.logger.log('Post loaded for update', 'execute');

    if (post.user.publicId !== userPublicId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'You are not allowed to update this post',
      });
    }

    await this.repo.updateDescription(post.id, description);

    this.logger.log('Post description updated', 'execute');
  }
}
