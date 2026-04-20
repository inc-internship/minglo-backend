import { Injectable } from '@nestjs/common';
import { PostsWithCursorViewDto, PostViewDto } from '../../api/view-dto';
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
    const post = await this.prisma.post.findUnique({
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

  async findUserPosts(
    userId: string,
    cursor?: string,
    limit: number = 8,
  ): Promise<PostsWithCursorViewDto> {
    const posts = await this.prisma.post.findMany({
      where: {
        user: { publicId: userId },
        deletedAt: null,
      },
      include: {
        user: true,
        postsMediaFiles: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit + 1,
      ...(cursor && {
        skip: 1,
        cursor: { publicId: cursor },
      }),
    });

    const hasNextPage = posts.length > limit;

    const items = hasNextPage ? posts.slice(0, limit) : posts;

    const nextCursor = hasNextPage ? items[items.length - 1].publicId : null;

    return {
      items: this.mapper.toViewList(items),
      nextCursor,
      hasNextPage,
    };
  }

  async findLatestPosts(limit: number = 4): Promise<PostViewDto[]> {
    const posts = await this.prisma.post.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      include: {
        user: true,
        postsMediaFiles: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return this.mapper.toViewList(posts);
  }
}
