import { MediaMimeType } from '@app/media/enums';

interface MediaFileRecord {
  publicId: string;
  url: string;
  key: string;
  mimeType: string;
  width: number;
  height: number;
  fileSize: number;
  usedAt: Date | null;
}

export class MediaFileMetaDataViewDto {
  publicId: string;
  url: string;
  key: string;
  mimeType: MediaMimeType;
  width: number;
  height: number;
  fileSize: number;
  usedAt: Date | null;

  static mapToViewDto(file: MediaFileRecord): MediaFileMetaDataViewDto {
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
