import { MediaFile } from '../../../../../apps/minglo-media-service/prisma/generated/prisma/client';
import { MediaMimeType } from '@app/media/enums';

export class MediaFileMetaDataViewDto {
  publicId: string;
  url: string;
  key: string;
  mimeType: MediaMimeType;
  width: number;
  height: number;
  fileSize: number;
  usedAt: Date | null;

  static mapToViewDto(file: MediaFile): MediaFileMetaDataViewDto {
    return {
      publicId: file.publicId,
      url: file.url,
      key: file.key,
      mimeType: file.mimeType as unknown as MediaMimeType,
      width: file.width,
      height: file.height,
      fileSize: file.fileSize,
      usedAt: file.usedAt,
    };
  }
}
