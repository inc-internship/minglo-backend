import { ConvertImageResult } from '../../../media/application/interfaces';
import { MediaMimeType, MediaType } from '@app/media/enums';

interface MediaFile {
  publicUserId: string;
  type: MediaType;
  mimeType: MediaMimeType;
  url: string;
  key: string;
  width: number;
  height: number;
  fileSize: number;
}

/**
 * Params for uploading a single image to S3
 */
export interface UploadImageToS3Params extends ConvertImageResult {
  type: MediaType;
  publicUserId: string;
}

/**
 * Params for uploading multiple images to S3
 */
export interface UploadManyImagesToS3Params {
  images: ConvertImageResult[];
  type: MediaType;
  publicUserId: string;
}

/**
 * Result of single image upload
 */
export type UploadedImageToS3Result = MediaFile;

/**
 * Result of multiple images upload
 */
export interface UploadedManyImagesToS3Result {
  uploadedImages: UploadedImageToS3Result[];
  failedCount: number;
}
