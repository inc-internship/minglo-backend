import {
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  PipeTransform,
} from '@nestjs/common';
import { DomainException, DomainExceptionCode } from '@app/exceptions';

interface ImageValidationOptions {
  /** Максимальный размер одного файла в байтах (по умолчанию 3 МБ) */
  maxSize?: number;
  /** Разрешённые расширения изображений (по умолчанию: png, jpg, jpeg, webp) */
  allowedExtensions?: string[];
}

/**
 * Кастомный pipe для валидации загружаемых изображений.
 * Проверяет размер файла и MIME-тип.
 */
export class ImageFilesValidationPipe implements PipeTransform {
  private readonly parseFilePipe: ParseFilePipe;
  private readonly allowedExtensions: string[];
  private readonly maxSize: number;
  private readonly maxSizeInMB: number;

  constructor(private readonly options?: ImageValidationOptions) {
    this.maxSize = options?.maxSize ?? 3 * 1024 * 1024; // 3 MB by default;
    this.maxSizeInMB = Math.round(this.maxSize / (1024 * 1024));
    this.allowedExtensions = options?.allowedExtensions ?? ['png', 'jpg', 'jpeg', 'webp'];

    this.parseFilePipe = new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: this.maxSize }),
        new FileTypeValidator({ fileType: `image/(${this.allowedExtensions.join('|')})` }),
      ],
      exceptionFactory: () => {
        throw new DomainException({
          code: DomainExceptionCode.ValidationError,
          message:
            `The file must be an image: ${this.allowedExtensions.join(', ')}. ` +
            `The file size must not exceed ${this.maxSizeInMB} MB.`,
        });
      },
    });
  }

  transform(value: Express.Multer.File[]): Promise<Express.Multer.File[]> {
    return this.parseFilePipe.transform(value);
  }
}
