import { ResizeOptions } from 'sharp';

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
  optimizedMimeTypeExtension: string;
}

export interface ConvertManyImagesResult {
  convertedImages: ConvertImageResult[];
  failedCount: number;
}
