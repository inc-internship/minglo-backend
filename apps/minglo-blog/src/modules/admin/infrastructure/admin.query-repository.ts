import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { PostWithUserAndMedia, UserWithProfile } from '../../../../prisma/types';
import { Prisma, User } from '../../../../prisma/generated/prisma/client';
import { AdminUserSortField } from '../api/enums/admin-user-sort.enum';
import { UsersQueryInput } from '../api/input-dto/users-query.input';
import { AdminBlockStatus } from '../api/enums/admin-block-status.enum';
import { PostsQueryInput } from '../api/input-dto/posts-query.input';

@Injectable()
export class AdminQueryRepository {
  constructor(private readonly prisma: PrismaService) {}
  async findUserDetail(publicId: string): Promise<UserWithProfile | null> {
    const user = await this.prisma.user.findUnique({
      where: { publicId, deletedAt: null },
      include: {
        profile: { include: { avatar: { where: { deletedAt: null } } } },
      },
    });
    return user;
  }

  async findUsersByPublicIds(publicIds: string[]): Promise<UserWithProfile[]> {
    return this.prisma.user.findMany({
      where: { publicId: { in: publicIds } },
      include: {
        profile: { include: { avatar: { where: { deletedAt: null } } } },
      },
    });
  }

  async findUserPublicIdsByLoginSearch(search: string): Promise<string[]> {
    const users = await this.prisma.user.findMany({
      where: {
        deletedAt: null,
        login: { contains: search, mode: 'insensitive' },
      },
      select: { publicId: true },
    });
    return users.map((u) => u.publicId);
  }

  async findUsersList(query: UsersQueryInput): Promise<{ users: User[]; totalCount: number }> {
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(query.search ? { login: { contains: query.search, mode: 'insensitive' as const } } : {}),
      ...(query.blockStatus === AdminBlockStatus.BLOCKED ? { blockedAt: { not: null } } : {}),
      ...(query.blockStatus === AdminBlockStatus.NOT_BLOCKED ? { blockedAt: null } : {}),
    };
    const [users, totalCount] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: this.toOrderBy(query.sortBy),
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.user.count({ where }),
    ]);
    return { users, totalCount };
  }

  async findPostsList(
    query: PostsQueryInput,
  ): Promise<{ posts: PostWithUserAndMedia[]; totalCount: number }> {
    const where: Prisma.PostWhereInput = {
      deletedAt: null,
      ...(query.search
        ? { user: { login: { contains: query.search, mode: 'insensitive' as const } } }
        : {}),
    };

    const cursorPost = query.cursor
      ? await this.prisma.post.findUnique({
          where: { publicId: query.cursor },
          select: { id: true },
        })
      : null;

    const [posts, totalCount] = await Promise.all([
      this.prisma.post.findMany({
        where,
        include: { user: true, postsMediaFiles: { where: { deletedAt: null } } },
        orderBy: { id: Prisma.SortOrder.desc },
        take: query.pageSize + 1,
        ...(cursorPost ? { cursor: { id: cursorPost.id }, skip: 1 } : {}),
      }),
      this.prisma.post.count({ where }),
    ]);

    return { posts, totalCount };
  }

  async findPostByPublicId(publicId: string): Promise<PostWithUserAndMedia | null> {
    return this.prisma.post.findUnique({
      where: { publicId },
      include: { user: true, postsMediaFiles: { where: { deletedAt: null } } },
    });
  }

  private toOrderBy(sortBy: AdminUserSortField) {
    switch (sortBy) {
      case AdminUserSortField.USERNAME_ASC:
        return { login: Prisma.SortOrder.asc };
      case AdminUserSortField.USERNAME_DESC:
        return { login: Prisma.SortOrder.desc };
      case AdminUserSortField.DATE_ASC:
        return { createdAt: Prisma.SortOrder.asc };
      case AdminUserSortField.DATE_DESC:
        return { createdAt: Prisma.SortOrder.desc };
    }
  }
}
