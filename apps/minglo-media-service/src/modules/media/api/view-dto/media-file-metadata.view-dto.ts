import { MediaFile } from '../../../../../prisma/generated/prisma/client';

export class MediaFileMetaDataViewDto {
  publicId: string;
  url: string;
  key: string;
  mimeType: string | null;
  width: number | null;
  height: number | null;
  fileSize: number | null;
  usedAt: Date | null;

  static mapToViewDto(file: MediaFile): MediaFileMetaDataViewDto {
    return {
      publicId: file.publicId,
      url: file.url,
      key: file.key,
      mimeType: file.mimeType,
      width: file.width,
      height: file.height,
      fileSize: file.fileSize,
      usedAt: file.usedAt,
    };
  }
}
