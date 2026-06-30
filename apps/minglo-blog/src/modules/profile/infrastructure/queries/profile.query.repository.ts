import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { ProfileViewDto } from '../../api/view-dto';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { LoggerService } from '@app/logger';
import { UserSearchItemViewDto, UsersSearchWithCursorViewDto } from '../../api/view-dto';

@Injectable()
export class ProfileQueryRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(ProfileQueryRepository.name);
  }

  async getProfile(userPublicId: string, currentUserPublicId: string | null): Promise<ProfileViewDto> {
    const user = await this.prisma.user.findUnique({
      where: { publicId: userPublicId, deletedAt: null },
      include: {
        profile: { include: { avatar: { where: { deletedAt: null } } } },
        _count: { select: { posts: { where: { deletedAt: null } } } },
      },
    });

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `User with id: ${userPublicId} not found`,
      });
    }

    const isFollowing = await this.resolveIsFollowing(currentUserPublicId, user.id, userPublicId);

    return ProfileViewDto.mapToView(user, isFollowing);
  }

  async searchUsers(
    username: string,
    currentUserPublicId: string | null,
    cursor?: string,
    limit: number = 10,
  ): Promise<UsersSearchWithCursorViewDto> {
    const currentUserId = await this.resolveCurrentUserId(currentUserPublicId);

    const users = await this.prisma.user.findMany({
      where: {
        login: { contains: username, mode: 'insensitive' },
        deletedAt: null,
      },
      include: {
        profile: { include: { avatar: { where: { deletedAt: null } } } },
        followers: { where: { followerId: currentUserId ?? -1 } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor && { skip: 1, cursor: { publicId: cursor } }),
    });

    const hasNextPage = users.length > limit;
    const items = hasNextPage ? users.slice(0, limit) : users;
    const nextCursor = hasNextPage ? items[items.length - 1].publicId : null;

    return {
      items: items.map((u): UserSearchItemViewDto => ({
        id: u.publicId,
        login: u.login,
        avatarUrl: u.profile?.avatar?.urlThumbnail ?? null,
        isFollowing: u.followers.length > 0,
      })),
      nextCursor,
      hasNextPage,
    };
  }

  private async resolveCurrentUserId(publicId: string | null): Promise<number | null> {
    if (!publicId) return null;
    const user = await this.prisma.user.findUnique({
      where: { publicId, deletedAt: null },
      select: { id: true },
    });
    return user?.id ?? null;
  }

  private async resolveIsFollowing(
    currentUserPublicId: string | null,
    targetUserId: number,
    targetUserPublicId: string,
  ): Promise<boolean> {
    if (!currentUserPublicId || currentUserPublicId === targetUserPublicId) return false;
    const currentUserId = await this.resolveCurrentUserId(currentUserPublicId);
    if (!currentUserId) return false;
    const follow = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: currentUserId, followingId: targetUserId } },
    });
    return !!follow;
  }
}