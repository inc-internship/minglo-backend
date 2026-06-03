import { ApiProperty } from '@nestjs/swagger';
import { PostOwner } from '../../../../../prisma/types';

class OwnerAvatarThumbnailViewDto {
  @ApiProperty({ type: String })
  url: string;

  @ApiProperty({ type: Number })
  width: number;

  @ApiProperty({ type: Number })
  height: number;

  @ApiProperty({ type: Number })
  fileSize: number;
}

export class PostOwnerViewDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  login: string;

  @ApiProperty({ type: String, nullable: true })
  firstName: string | null;

  @ApiProperty({ type: String, nullable: true })
  lastName: string | null;

  @ApiProperty({ type: OwnerAvatarThumbnailViewDto, nullable: true })
  avatar: OwnerAvatarThumbnailViewDto | null;

  private constructor(owner: PostOwner) {
    this.id = owner.publicId;
    this.login = owner.login;
    this.firstName = owner.profile?.firstName ?? null;
    this.lastName = owner.profile?.lastName ?? null;

    const avatarRecord = owner.profile?.avatar ?? null;
    this.avatar = avatarRecord
      ? {
          url: avatarRecord.urlThumbnail,
          width: avatarRecord.widthThumbnail,
          height: avatarRecord.heightThumbnail,
          fileSize: avatarRecord.fileSizeThumbnail,
        }
      : null;
  }

  static create(owner: PostOwner): PostOwnerViewDto {
    return new this(owner);
  }
}
