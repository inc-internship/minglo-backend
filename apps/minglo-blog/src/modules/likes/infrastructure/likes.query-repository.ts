import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { PostLikeViewDto, PostLikesWithCursorViewDto } from '../api/view-dto';
import { PostLikeWithUser } from '../../../../prisma/types';

@Injectable()
export class LikesQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPostLikes(
    postPublicId: string,
    cursor?: string,
    limit: number = 10,
  ): Promise<PostLikesWithCursorViewDto> {
    const likes = await this.prisma.postLike.findMany({
      where: {
        post: { publicId: postPublicId, deletedAt: null },
      },
      include: {
        user: {
          include: {
            profile: { include: { avatar: { where: { deletedAt: null } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor && { skip: 1, cursor: { publicId: cursor } }),
    });

    const hasNextPage = likes.length > limit;
    const items = hasNextPage ? likes.slice(0, limit) : likes;
    const nextCursor = hasNextPage ? items[items.length - 1].publicId : null;

    return {
      items: items.map((l: PostLikeWithUser) => this.toView(l)),
      nextCursor,
      hasNextPage,
    };
  }

  private toView(like: PostLikeWithUser): PostLikeViewDto {
    return {
      id: like.user.publicId,
      login: like.user.login,
      avatarUrl: like.user.profile?.avatar?.urlThumbnail ?? null,
      likedAt: like.createdAt.toISOString(),
    };
  }
}
