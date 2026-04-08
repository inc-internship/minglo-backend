import { ProcessImageResult } from '../../../media/application/interfaces';
import { MediaType } from '../../../../../prisma/generated/prisma/enums';

/**
 * Params for uploading a single image to S3
 */
export interface ImageUploadToS3Params extends ProcessImageResult {
  type: MediaType;
  publicUserId: string;
}

/**
 * Params for uploading multiple images to S3
 */
export interface ImageUploadToS3ParamsMany {
  images: ProcessImageResult[];
  type: MediaType;
  publicUserId: string;
}

/**
 * Result of single image upload
 */
export interface ImageUploadToS3Result {
  /* file public url */
  url: string;
  /* file path in bucket */
  key: string;
}

/**
 * Result of multiple images upload
 */
export interface ImageUploadToS3ResultMany {
  images: ImageUploadToS3Result[];
  failedCount: number;
}
