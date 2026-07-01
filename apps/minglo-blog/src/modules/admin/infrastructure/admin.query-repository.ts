import { Injectable } from '@nestjs/common';
import { PrismaService } from 'apps/minglo-blog/src/database/prisma.service';
import { UserWithProfile } from '../../../../prisma/types';
import { Prisma, User } from 'apps/minglo-blog/prisma/generated/prisma/client';
import { AdminUserSortField } from '../api/enums/admin-user-sort.enum';
import { UsersQueryInput } from '../api/input-dto/users-query.input';

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

  async findUsersList(query: UsersQueryInput): Promise<{ users: User[]; totalCount: number }> {
    const where = {
      deletedAt: null,
      ...(query.search ? { login: { contains: query.search, mode: 'insensitive' as const } } : {}),
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
