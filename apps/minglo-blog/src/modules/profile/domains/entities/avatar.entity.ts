import { MediaMimeType } from '@app/media/enums';
import { UploadImageProfileDto } from '@app/media/dto/upload-image-profile.dto';

export class AvatarEntity {
  profileId: number;
  mimeType: MediaMimeType;

  originalMediaId: string;
  urlOriginal: string;
  keyOriginal: string;
  fileSizeOriginal: number;
  widthOriginal: number;
  heightOriginal: number;

  thumbnailMediaId: string;
  urlThumbnail: string;
  keyThumbnail: string;
  fileSizeThumbnail: number;
  widthThumbnail: number;
  heightThumbnail: number;

  static create(dto: UploadImageProfileDto, profileId: number): AvatarEntity {
    const avatar = new this();

    avatar.profileId = profileId;
    avatar.mimeType = dto.original.mimeType;

    avatar.originalMediaId = dto.original.id;
    avatar.urlOriginal = dto.original.url;
    avatar.keyOriginal = dto.original.key;
    avatar.fileSizeOriginal = dto.original.fileSize;
    avatar.widthOriginal = dto.original.width;
    avatar.heightOriginal = dto.original.height;

    avatar.thumbnailMediaId = dto.thumbnail.id;
    avatar.urlThumbnail = dto.thumbnail.url;
    avatar.keyThumbnail = dto.thumbnail.key;
    avatar.fileSizeThumbnail = dto.thumbnail.fileSize;
    avatar.widthThumbnail = dto.thumbnail.width;
    avatar.heightThumbnail = dto.thumbnail.height;

    return avatar;
  }
}
