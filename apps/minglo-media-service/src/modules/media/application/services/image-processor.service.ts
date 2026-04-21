import { LoggerService } from '@app/logger';
import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import pLimit from 'p-limit';
import {
  ConvertImageResult,
  ConvertManyImagesResult,
  ResizeAndConvertManyParams,
  ResizeAndConvertParams,
} from '../interfaces';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { MediaConfig } from '../../../core/media.config';
import { MediaMimeType } from '@app/media/enums';

/**
 * Сервис для обработки изображений.
 *
 * Основные функции:
 *  - Изменение размера изображения с сохранением пропорций
 *  - Конвертация в формат .webp
 *  - Обработка массивов изображений с логированием успешных и неудачных операций
 */
@Injectable()
export class ImageProcessorService {
  constructor(
    private readonly logger: LoggerService,
    private readonly config: MediaConfig,
  ) {
    this.logger.setContext(ImageProcessorService.name);
  }

  /* Уменьшает изображение с сохранением пропорций и конвертирует в .webp */
  async resizeAndConvertToWebp({
    file,
    options,
  }: ResizeAndConvertParams): Promise<ConvertImageResult> {
    const fileName = file.filename;

    try {
      const { data, info } = await sharp(file.buffer)
        .resize({
          width: options?.width ?? 504,
          height: options?.height ?? 504,
          fit: options?.fit ?? 'inside',
        })
        .webp({ quality: 80 })
        .toBuffer({ resolveWithObject: true });

      this.logger.log(
        `Processed image ${fileName} result: ${info.width}x${info.height}, size=${info.size}`,
      );

      return {
        file,
        optimizedBuffer: data,
        optimizedWidth: info.width,
        optimizedHeight: info.height,
        optimizedFileSize: info.size,
        optimizedFileExtension: 'webp',
        optimizedMimeTypeExtension: MediaMimeType.IMAGE_WEBP,
      };
    } catch (error) {
      this.logger.error(`Failed to process image ${fileName}`, error);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: 'Image processing failed',
      });
    }
  }

  /*
   * Уменьшает массив изображений с сохранением пропорций и конвертирует в .webp
   * Кол-во одновременных процессов ограничено до 2-х
   */
  async resizeAndConvertToWebpMany({
    files,
    options,
  }: ResizeAndConvertManyParams): Promise<ConvertManyImagesResult> {
    const limit = pLimit(this.config.imageProcessingConcurrency); // ограничение на кол-во одновременных процессов

    // Ограничиваем параллельные вызовы
    const tasks = files.map((file) => limit(() => this.resizeAndConvertToWebp({ file, options })));

    const results = await Promise.allSettled(tasks);

    const successful = results
      .filter((r): r is PromiseFulfilledResult<ConvertImageResult> => r.status === 'fulfilled')
      .map((r) => r.value);

    const failedCount = results.filter((r) => r.status === 'rejected').length;

    if (failedCount > 0) {
      this.logger.warn(
        `Batch images processing: ${successful.length} succeeded, ${failedCount} failed`,
      );
    }

    if (!successful.length) {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: `All images processing failed, total images: ${failedCount} `,
      });
    }

    this.logger.log(
      `Batch images processing completed: ${successful.length} succeeded, ${failedCount} failed, total images: ${tasks.length} `,
    );

    return {
      convertedImages: successful,
      failedCount,
    };
  }
}
