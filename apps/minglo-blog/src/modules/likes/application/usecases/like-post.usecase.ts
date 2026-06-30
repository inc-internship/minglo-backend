import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { LikesRepository } from '../../infrastructure/likes.repository';
import { UserQueryRepository } from '../../../user-account/infrastructure/queries';
import { PrismaService } from '../../../../database/prisma.service';
import { DomainException, DomainExceptionCode } from '@app/exceptions';

export class LikePostCommand {
  constructor(
    public readonly postPublicId: string,
    public readonly userPublicId: string,
  ) {}
}

@CommandHandler(LikePostCommand)
export class LikePostUseCase implements ICommandHandler<LikePostCommand, void> {
  constructor(
    private readonly likesRepo: LikesRepository,
    private readonly userQueryRepo: UserQueryRepository,
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(LikePostUseCase.name);
  }

  async execute({ postPublicId, userPublicId }: LikePostCommand): Promise<void> {
    this.logger.log(`LikePost postId=${postPublicId}`, 'execute');

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
    await this.likesRepo.likePost(post.id, userId);
  }
}