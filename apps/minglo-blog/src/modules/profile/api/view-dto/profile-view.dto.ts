import { ApiProperty } from '@nestjs/swagger';
import { ProfileWithUserAndAvatar } from '../../../../../prisma/types';
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

  static mapToView(profile: ProfileWithUserAndAvatar): ProfileViewDto {
    const dto = new ProfileViewDto();

    dto.firstName = profile.firstName;
    dto.lastName = profile.lastName;
    dto.login = profile.user.login;
    dto.accountType = profile.user.accountType as AccountType;
    dto.birthday = profile.birthday ? profile.birthday.toISOString() : null;
    dto.countryId = profile.countryId;
    dto.cityId = profile.cityId;
    dto.aboutMe = profile.aboutMe;

    dto.avatar = profile.avatar
      ? {
          original: {
            id: profile.avatar.originalMediaId,
            url: profile.avatar.urlOriginal,
            width: profile.avatar.widthOriginal,
            height: profile.avatar.heightOriginal,
            fileSize: profile.avatar.fileSizeOriginal,
          },
          thumbnail: {
            id: profile.avatar.thumbnailMediaId,
            url: profile.avatar.urlThumbnail,
            width: profile.avatar.widthThumbnail,
            height: profile.avatar.heightThumbnail,
            fileSize: profile.avatar.fileSizeThumbnail,
          },
        }
      : null;

    return dto;
  }
}
