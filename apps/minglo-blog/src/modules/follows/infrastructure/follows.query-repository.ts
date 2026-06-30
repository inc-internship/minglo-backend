import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { FollowViewDto, FollowsWithCursorViewDto } from '../api/view-dto';
import { FollowWithFollowerData, FollowWithFollowingData } from '../../../../prisma/types';

@Injectable()
export class FollowsQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findFollowers(
    userPublicId: string,
    cursor?: string,
    limit: number = 10,
  ): Promise<FollowsWithCursorViewDto> {
    const follows = await this.prisma.follow.findMany({
      where: {
        following: { publicId: userPublicId, deletedAt: null },
      },
      include: {
        follower: {
          include: {
            profile: { include: { avatar: { where: { deletedAt: null } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor && { skip: 1, cursor: { publicId: cursor } }),
    });

    const hasNextPage = follows.length > limit;
    const items = hasNextPage ? follows.slice(0, limit) : follows;
    const nextCursor = hasNextPage ? items[items.length - 1].publicId : null;

    return {
      items: items.map((f: FollowWithFollowerData) => this.toFollowerView(f)),
      nextCursor,
      hasNextPage,
    };
  }

  async findFollowing(
    userPublicId: string,
    cursor?: string,
    limit: number = 10,
  ): Promise<FollowsWithCursorViewDto> {
    const follows = await this.prisma.follow.findMany({
      where: {
        follower: { publicId: userPublicId, deletedAt: null },
      },
      include: {
        following: {
          include: {
            profile: { include: { avatar: { where: { deletedAt: null } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor && { skip: 1, cursor: { publicId: cursor } }),
    });

    const hasNextPage = follows.length > limit;
    const items = hasNextPage ? follows.slice(0, limit) : follows;
    const nextCursor = hasNextPage ? items[items.length - 1].publicId : null;

    return {
      items: items.map((f: FollowWithFollowingData) => this.toFollowingView(f)),
      nextCursor,
      hasNextPage,
    };
  }

  private toFollowerView(follow: FollowWithFollowerData): FollowViewDto {
    const { follower, createdAt } = follow;
    return {
      id: follower.publicId,
      login: follower.login,
      avatarUrl: follower.profile?.avatar?.urlThumbnail ?? null,
      followedAt: createdAt.toISOString(),
    };
  }

  private toFollowingView(follow: FollowWithFollowingData): FollowViewDto {
    const { following, createdAt } = follow;
    return {
      id: following.publicId,
      login: following.login,
      avatarUrl: following.profile?.avatar?.urlThumbnail ?? null,
      followedAt: createdAt.toISOString(),
    };
  }
}
