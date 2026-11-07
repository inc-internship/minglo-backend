import { ApiProperty } from '@nestjs/swagger';
import { UserWithProfileForPublicView } from '../../../../../prisma/types';
import { AccountType } from '../../../../shared/enums';

class AvatarImageDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  url: string;

  @ApiProperty({ type: Number })
  width: number;

  @ApiProperty({ type: Number })
  height: number;

  @ApiProperty({ type: Number })
  fileSize: number;
}

class AvatarDto {
  @ApiProperty({ type: AvatarImageDto })
  original: AvatarImageDto;

  @ApiProperty({ type: AvatarImageDto })
  thumbnail: AvatarImageDto;
}

export class ProfileViewDto {
  @ApiProperty({ type: String, nullable: true })
  firstName: string | null;

  @ApiProperty({ type: String, nullable: true })
  lastName: string | null;

  @ApiProperty({ type: String })
  login: string;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  birthday: string | null;

  @ApiProperty({ type: String, nullable: true })
  countryId: string | null;

  @ApiProperty({ type: String, nullable: true })
  cityId: string | null;

  @ApiProperty({ type: String, nullable: true })
  aboutMe: string | null;

  @ApiProperty({ enum: AccountType, enumName: 'AccountType' })
  accountType: AccountType;

  @ApiProperty({ type: AvatarDto, nullable: true })
  avatar: AvatarDto | null;

  @ApiProperty({ type: Number })
  followersCount: number;

  @ApiProperty({ type: Number })
  followingCount: number;

  @ApiProperty({ type: Number })
  postsCount: number;

  @ApiProperty({ type: Boolean })
  isFollowing: boolean;

  static mapToView(user: UserWithProfileForPublicView, isFollowing: boolean): ProfileViewDto {
    const dto = new ProfileViewDto();
    const profile = user.profile;

    dto.firstName = profile?.firstName ?? null;
    dto.lastName = profile?.lastName ?? null;
    dto.login = user.login;
    dto.accountType = user.accountType as AccountType;
    dto.birthday = profile?.birthday ? profile.birthday.toISOString() : null;
    dto.countryId = profile?.countryId ?? null;
    dto.cityId = profile?.cityId ?? null;
    dto.aboutMe = profile?.aboutMe ?? null;
    dto.followersCount = user.followersCount;
    dto.followingCount = user.followingCount;
    dto.postsCount = user._count.posts;
    dto.isFollowing = isFollowing;

    const avatarRecord = profile?.avatar ?? null;
    dto.avatar = avatarRecord
      ? {
          original: {
            id: avatarRecord.originalMediaId,
            url: avatarRecord.urlOriginal,
            width: avatarRecord.widthOriginal,
            height: avatarRecord.heightOriginal,
            fileSize: avatarRecord.fileSizeOriginal,
          },
          thumbnail: {
            id: avatarRecord.thumbnailMediaId,
            url: avatarRecord.urlThumbnail,
            width: avatarRecord.widthThumbnail,
            height: avatarRecord.heightThumbnail,
            fileSize: avatarRecord.fileSizeThumbnail,
          },
        }
      : null;

    return dto;
  }
}
