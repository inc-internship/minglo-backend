import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { CommentEntity } from '../../domains/entities/comment.entity';
import { UserQueryRepository } from '../../../user-account/infrastructure/queries';
import { PrismaService } from '../../../../database/prisma.service';

export class CreateCommentCommand {
  constructor(
    public readonly postPublicId: string,
    public readonly authorPublicId: string,
    public readonly text: string,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase implements ICommandHandler<CreateCommentCommand, string> {
  constructor(
    private readonly commentsRepo: CommentsRepository,
    private readonly userQueryRepo: UserQueryRepository,
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(CreateCommentUseCase.name);
  }

  async execute({ postPublicId, authorPublicId, text }: CreateCommentCommand): Promise<string> {
    this.logger.log(`CreateComment postId=${postPublicId}`, 'execute');

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

    const authorId = await this.userQueryRepo.findIdByPublicId(authorPublicId);
    const comment = CommentEntity.create({ postId: post.id, authorId, text });

    return this.commentsRepo.create(comment);
  }
}
