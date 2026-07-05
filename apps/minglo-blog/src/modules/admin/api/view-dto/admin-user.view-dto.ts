import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../../../../prisma/generated/prisma/client';
import { PaginatedType } from './paginated.view-dto';

@ObjectType()
export class AdminUserType {
  @Field() id: string;
  @Field() username: string;
  @Field() profileLink: string;
  @Field() createdAt: string;
  @Field() isBlocked: boolean;

  static mapToView(user: User): AdminUserType {
    const dto = new AdminUserType();
    dto.id = user.publicId;
    dto.username = user.login;
    dto.profileLink = `/profile/${user.publicId}`;
    dto.createdAt = user.createdAt.toISOString();
    dto.isBlocked = !!user.blockedAt;
    return dto;
  }
}

@ObjectType()
export class UsersPageType extends PaginatedType(AdminUserType) {
  static mapToView(
    users: User[],
    totalCount: number,
    page: number,
    pageSize: number,
  ): UsersPageType {
    const dto = new UsersPageType();
    dto.items = users.map((u) => AdminUserType.mapToView(u));
    dto.totalCount = totalCount;
    dto.pagesCount = Math.ceil(totalCount / pageSize);
    dto.page = page;
    return dto;
  }
}
