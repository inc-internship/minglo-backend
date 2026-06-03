import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProfileWithUserAndAvatar } from '../../../../../prisma/types';

class PhotoDetailsDto {
  @ApiProperty({
    example: 'https://s3.storage/bucket/original_uuid.jpg',
    description: 'Полная ссылка на изображение',
  })
  url: string;

  @ApiProperty({ example: 'image/jpeg' })
  mimeType: string;

  @ApiProperty({ example: 1048576, description: 'Размер файла в байтах' })
  fileSize: number;

  @ApiProperty({ example: 1080 })
  width: number;

  @ApiProperty({ example: 1080 })
  height: number;
}

export class ProfileViewDto {
  @ApiProperty({ example: 'Ivan' })
  firstName: string;

  @ApiProperty({ example: 'Ivanov' })
  lastName: string;

  @ApiProperty({ example: 'example1' })
  login: string;

  @ApiPropertyOptional({ example: '2000-01-01T00:00:00.000Z' })
  birthday: string | null;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  countryId: string | null;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  cityId: string | null;

  @ApiPropertyOptional({ example: 'Backend developer & Mushroom hunter', maxLength: 500 })
  aboutMe: string | null;

  @ApiPropertyOptional({ type: PhotoDetailsDto, nullable: true })
  avatar: PhotoDetailsDto | null;

  static mapToView(profile: ProfileWithUserAndAvatar): ProfileViewDto {
    const dto = new ProfileViewDto();

    dto.firstName = profile.firstName;
    dto.lastName = profile.lastName;
    dto.login = profile.user.login;
    dto.birthday = profile.birthday ? profile.birthday.toISOString() : null;
    dto.countryId = profile.countryId;
    dto.cityId = profile.cityId;
    dto.aboutMe = profile.aboutMe;

    dto.avatar = profile.avatar
      ? {
          url: profile.avatar.urlLarge,
          mimeType: profile.avatar.mimeType,
          fileSize: profile.avatar.fileSizeLarge,
          width: profile.avatar.widthLarge,
          height: profile.avatar.heightLarge,
        }
      : null;

    return dto;
  }
}
