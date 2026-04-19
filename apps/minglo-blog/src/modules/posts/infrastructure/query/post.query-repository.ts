import { Injectable } from '@nestjs/common';
import { PostViewDto } from '../../api/view-dto';
import { PrismaService } from '../../../../database/prisma.service';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { PostViewMapper } from '../../application/mappers';

@Injectable()
export class PostQueryRepository {
  constructor(
    private readonly mapper: PostViewMapper,
    private readonly prisma: PrismaService,
  ) {}

  async findByPublicIdOrFail(publicId: string): Promise<PostViewDto> {
    const post = await this.prisma.post.findUniqueOrThrow({
      where: { publicId, deletedAt: null },
      include: {
        user: true,
        postsMediaFiles: true,
      },
    });

    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
        extensions: [{ field: 'postId', message: 'Post not found' }],
      });
    }

    return this.mapper.toView(post);
  }
}
