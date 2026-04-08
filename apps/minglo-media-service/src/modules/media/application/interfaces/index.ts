import { ResizeOptions } from 'sharp';

export interface ResizeAndConvertParams {
  file: Express.Multer.File;
  options?: ResizeOptions;
}

export interface ResizeAndConvertManyParams {
  files: Express.Multer.File[];
  options?: ResizeOptions;
}

export interface ProcessImageResult {
  file: Express.Multer.File;
  optimizedBuffer: Buffer;
  optimizedWidth: number;
  optimizedHeight: number;
  optimizedFileSize: number;
  optimizedFileExtension: string;
  optimizedMimeTypeExtension: string;
}

export interface ProcessManyImagesResult {
  successfulImages: ProcessImageResult[];
  failedCount: number;
}
