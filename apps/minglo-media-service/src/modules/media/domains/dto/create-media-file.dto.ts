import { UploadedImageToS3Result } from '../../../storage/application/interfaces';
import { MediaMimeType, MediaType } from '@app/media/enums';

export class CreateMediaFileDto implements UploadedImageToS3Result {
  publicUserId: string;
  type: MediaType;
  mimeType: MediaMimeType;
  url: string;
  key: string;
  width: number;
  height: number;
  fileSize: number;
}
