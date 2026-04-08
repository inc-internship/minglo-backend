import { ConvertImageResult } from '../../../media/application/interfaces';
import { MediaType } from '../../../../../prisma/generated/prisma/enums';

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
export interface UploadedImageToS3Result {
  /* file public url */
  url: string;
  /* file path in bucket */
  key: string;
}

/**
 * Result of multiple images upload
 */
export interface UploadedManyImagesToS3Result {
  uploadedImages: UploadedImageToS3Result[];
  failedCount: number;
}
