import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { LikesRepository } from '../../infrastructure/likes.repository';
import { UserQueryRepository } from '../../../user-account/infrastructure/queries';
import { PrismaService } from '../../../../database/prisma.service';
import { DomainException, DomainExceptionCode } from '@app/exceptions';

export class UnlikeCommentCommand {
  constructor(
    public readonly commentPublicId: string,
    public readonly userPublicId: string,
  ) {}
}

@CommandHandler(UnlikeCommentCommand)
export class UnlikeCommentUseCase implements ICommandHandler<UnlikeCommentCommand, void> {
  constructor(
    private readonly likesRepo: LikesRepository,
    private readonly userQueryRepo: UserQueryRepository,
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(UnlikeCommentUseCase.name);
  }

  async execute({ commentPublicId, userPublicId }: UnlikeCommentCommand): Promise<void> {
    this.logger.log(`UnlikeComment commentId=${commentPublicId}`, 'execute');

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
    await this.likesRepo.unlikeComment(comment.id, userId);
  }
}