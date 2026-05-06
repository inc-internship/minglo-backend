import { ResizeOptions } from 'sharp';
import { MediaMimeType } from '@app/media/enums';

export interface ResizeAndConvertParams {
  file: Express.Multer.File;
  options?: ResizeOptions;
}

export interface ResizeAndConvertManyParams {
  files: Express.Multer.File[];
  options?: ResizeOptions;
}

export interface ConvertImageResult {
  file: Express.Multer.File;
  optimizedBuffer: Buffer;
  optimizedWidth: number;
  optimizedHeight: number;
  optimizedFileSize: number;
  optimizedFileExtension: string;
  optimizedMimeTypeExtension: MediaMimeType;
}

export interface ConvertManyImagesResult {
  convertedImages: ConvertImageResult[];
  failedCount: number;
}
