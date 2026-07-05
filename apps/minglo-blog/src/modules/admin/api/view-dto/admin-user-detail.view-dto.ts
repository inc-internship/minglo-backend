import { Field, Int, ObjectType } from '@nestjs/graphql';
import { UserWithProfile } from '../../../../../prisma/types';

@ObjectType()
export class AdminUserDetailType {
  @Field() id: string;
  @Field() username: string;
  @Field() profileLink: string;
  @Field() createdAt: string;
  @Field() isBlocked: boolean;
  @Field(() => String, { nullable: true }) avatarUrl: string | null;
  @Field(() => String, { nullable: true }) firstName: string | null;
  @Field(() => String, { nullable: true }) lastName: string | null;
  @Field(() => Int) followersCount: number;
  @Field(() => Int) followingCount: number;

  static mapToView(user: UserWithProfile): AdminUserDetailType {
    const dto = new AdminUserDetailType();
    dto.id = user.publicId;
    dto.username = user.login;
    dto.profileLink = `/profile/${user.publicId}`;
    dto.createdAt = user.createdAt.toISOString();
    dto.isBlocked = !!user.blockedAt;
    dto.avatarUrl = user.profile?.avatar?.urlThumbnail ?? null;
    dto.firstName = user.profile?.firstName ?? null;
    dto.lastName = user.profile?.lastName ?? null;
    dto.followersCount = user.followersCount;
    dto.followingCount = user.followingCount;
    return dto;
  }
}
