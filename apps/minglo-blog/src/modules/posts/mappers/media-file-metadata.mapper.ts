import { MediaFileMetaDataViewDto } from '@app/media/api/view-dto';
import { MediaMimeType } from '@app/media/enums';

export type PostMediaFileMetaData = {
  url: string;
  key: string;
  mimeType: MediaMimeType;
  width: number;
  height: number;
  fileSize: number;
};

export class MediaFileMetaDataMapper {
  static toPostMediaInput(m: MediaFileMetaDataViewDto): PostMediaFileMetaData {
    return {
      url: m.url,
      key: m.key,
      mimeType: m.mimeType,
      width: m.width,
      height: m.height,
      fileSize: m.fileSize,
    };
  }
}
