import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { LikesRepository } from '../../infrastructure/likes.repository';
import { UserQueryRepository } from '../../../user-account/infrastructure/queries';
import { PrismaService } from '../../../../database/prisma.service';
import { DomainException, DomainExceptionCode } from '@app/exceptions';

export class LikeCommentCommand {
  constructor(
    public readonly commentPublicId: string,
    public readonly userPublicId: string,
  ) {}
}

@CommandHandler(LikeCommentCommand)
export class LikeCommentUseCase implements ICommandHandler<LikeCommentCommand, void> {
  constructor(
    private readonly likesRepo: LikesRepository,
    private readonly userQueryRepo: UserQueryRepository,
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(LikeCommentUseCase.name);
  }

  async execute({ commentPublicId, userPublicId }: LikeCommentCommand): Promise<void> {
    this.logger.log(`LikeComment commentId=${commentPublicId}`, 'execute');

    const comment = await this.prisma.comment.findUnique({
      where: { publicId: commentPublicId, deletedAt: null },
      select: { id: true },
    });

    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment not found',
        extensions: [{ field: 'commentId', message: 'Comment not found' }],
      });
    }

    const userId = await this.userQueryRepo.findIdByPublicId(userPublicId);
    await this.likesRepo.likeComment(comment.id, userId);
  }
}