import { Field, ObjectType } from '@nestjs/graphql';
import { FollowWithFollowerData, FollowWithFollowingData } from '../../../../../prisma/types';
import { PaginatedType } from './paginated.view-dto';

@ObjectType()
export class FollowUserType {
  @Field() userId: string;
  @Field() username: string;
  @Field(() => String, { nullable: true }) avatarUrl: string | null;

  static fromFollower(f: FollowWithFollowerData): FollowUserType {
    const dto = new FollowUserType();
    dto.userId = f.follower.publicId;
    dto.username = f.follower.login;
    dto.avatarUrl = f.follower.profile?.avatar?.urlThumbnail ?? null;
    return dto;
  }

  static fromFollowing(f: FollowWithFollowingData): FollowUserType {
    const dto = new FollowUserType();
    dto.userId = f.following.publicId;
    dto.username = f.following.login;
    dto.avatarUrl = f.following.profile?.avatar?.urlThumbnail ?? null;
    return dto;
  }
}

@ObjectType()
export class FollowsPageType extends PaginatedType(FollowUserType) {
  static mapToView(
    items: FollowUserType[],
    totalCount: number,
    page: number,
    pageSize: number,
  ): FollowsPageType {
    const dto = new FollowsPageType();
    dto.items = items;
    dto.totalCount = totalCount;
    dto.pagesCount = Math.ceil(totalCount / pageSize);
    dto.page = page;
    return dto;
  }
}
