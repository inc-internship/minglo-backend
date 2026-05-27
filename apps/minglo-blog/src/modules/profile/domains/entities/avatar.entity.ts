import { MediaFileMetaDataViewDto } from '@app/media/api/view-dto';
import { MediaMimeType } from '@app/media/enums';

export class AvatarEntity {
  profileId: number;
  mimeType: MediaMimeType;

  urlLarge: string;
  keyLarge: string;
  fileSizeLarge: number;
  widthLarge: number;
  heightLarge: number;

  urlSmall: string;
  keySmall: string;
  fileSizeSmall: number;
  widthSmall: number;
  heightSmall: number;

  static create(images: MediaFileMetaDataViewDto[], profileId: number): AvatarEntity {
    const avatar = new this();

    const sorted = [...images].sort((a, b) => b.width - a.width);
    const [large, small] = sorted;

    avatar.profileId = profileId;
    avatar.mimeType = large.mimeType;

    // Мапим Large
    avatar.urlLarge = large.url;
    avatar.keyLarge = large.key;
    avatar.fileSizeLarge = large.fileSize;
    avatar.widthLarge = large.width;
    avatar.heightLarge = large.height;

    // Мапим Small
    avatar.urlSmall = small.url;
    avatar.keySmall = small.key;
    avatar.fileSizeSmall = small.fileSize;
    avatar.widthSmall = small.width;
    avatar.heightSmall = small.height;

    return avatar;
  }
}
