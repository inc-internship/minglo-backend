import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { LikesRepository } from '../../infrastructure/likes.repository';
import { UserQueryRepository } from '../../../user-account/infrastructure/queries';
import { PrismaService } from '../../../../database/prisma.service';
import { DomainException, DomainExceptionCode } from '@app/exceptions';

export class UnlikePostCommand {
  constructor(
    public readonly postPublicId: string,
    public readonly userPublicId: string,
  ) {}
}

@CommandHandler(UnlikePostCommand)
export class UnlikePostUseCase implements ICommandHandler<UnlikePostCommand, void> {
  constructor(
    private readonly likesRepo: LikesRepository,
    private readonly userQueryRepo: UserQueryRepository,
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(UnlikePostUseCase.name);
  }

  async execute({ postPublicId, userPublicId }: UnlikePostCommand): Promise<void> {
    this.logger.log(`UnlikePost postId=${postPublicId}`, 'execute');

    const post = await this.prisma.post.findUnique({
      where: { publicId: postPublicId, deletedAt: null },
      select: { id: true },
    });

    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
        extensions: [{ field: 'postId', message: 'Post not found' }],
      });
    }

    const userId = await this.userQueryRepo.findIdByPublicId(userPublicId);
    await this.likesRepo.unlikePost(post.id, userId);
  }
}