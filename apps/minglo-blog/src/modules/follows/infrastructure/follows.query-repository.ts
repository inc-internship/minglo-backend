import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { FollowViewDto, FollowsWithCursorViewDto } from '../api/view-dto';
import { FollowWithFollowerData, FollowWithFollowingData } from '../../../../prisma/types';

type PaginatedFollowsParams = {
  where:
    | { following: { publicId: string; deletedAt: null } }
    | { follower: { publicId: string; deletedAt: null } };
  query: { page; pageSize };
};

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

  private async findFollowsPaginated({ where, query }: PaginatedFollowsParams) {
    const [follows, totalCount] = await Promise.all([
      this.prisma.follow.findMany({
        where,
        include: {
          follower: {
            include: { profile: { include: { avatar: { where: { deletedAt: null } } } } },
          },
          following: {
            include: { profile: { include: { avatar: { where: { deletedAt: null } } } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.follow.count({ where }),
    ]);
    return { follows, totalCount };
  }

  async findFollowersPaginated(userPublicId: string, query: { page: number; pageSize: number }) {
    return this.findFollowsPaginated({
      where: { following: { publicId: userPublicId, deletedAt: null } },
      query,
    });
  }
  async findFollowingPaginated(userPublicId: string, query: { page: number; pageSize: number }) {
    return this.findFollowsPaginated({
      where: { follower: { publicId: userPublicId, deletedAt: null } },
      query,
    });
  }
}
