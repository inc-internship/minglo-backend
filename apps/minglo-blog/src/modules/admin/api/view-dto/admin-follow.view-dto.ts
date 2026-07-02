import { Field, Int, ObjectType } from '@nestjs/graphql';
import { FollowWithFollowerData, FollowWithFollowingData } from '../../../../../prisma/types';

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
export class FollowsPageType {
  @Field(() => [FollowUserType]) items: FollowUserType[];
  @Field(() => Int) totalCount: number;
  @Field(() => Int) pagesCount: number;
  @Field(() => Int) page: number;

  static fromFollowers(
    follows: FollowWithFollowerData[],
    totalCount: number,
    page: number,
    pageSize: number,
  ): FollowsPageType {
    const dto = new FollowsPageType();
    dto.items = follows.map((f) => FollowUserType.fromFollower(f));
    dto.totalCount = totalCount;
    dto.pagesCount = Math.ceil(totalCount / pageSize);
    dto.page = page;
    return dto;
  }

  static fromFollowing(
    follows: FollowWithFollowingData[],
    totalCount: number,
    page: number,
    pageSize: number,
  ): FollowsPageType {
    const dto = new FollowsPageType();
    dto.items = follows.map((f) => FollowUserType.fromFollowing(f));
    dto.totalCount = totalCount;
    dto.pagesCount = Math.ceil(totalCount / pageSize);
    dto.page = page;
    return dto;
  }
}
