import { HttpService } from '@nestjs/axios';
import { CoreConfig } from '../../../../core/core.config';
import { JwtService } from '@nestjs/jwt';
import { LoggerService } from '@app/logger';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ActiveUserDto } from '../../../../core/decorators/auth/dto';
import { MediaAuthorizedServices, MediaType } from '@app/media/enums';
import FormData from 'form-data';
import { firstValueFrom } from 'rxjs';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { Inject } from '@nestjs/common';
import { MEDIA_ACCESS_TOKEN_STRATEGY_INJECT_TOKEN } from '@app/media/constants';
import { Readable } from 'stream';
import { UploadImageProfileDto } from '@app/media/dto/upload-image-profile.dto';
import { getFileTypeFromBuffer, SupportedFileType } from '../../helpers/file-type.helper';

export class UploadAvatarImagesCommand {
  constructor(
    public readonly fileStream: Readable,
    public readonly filename: string,
    public readonly user: ActiveUserDto,
  ) {}
}

@CommandHandler(UploadAvatarImagesCommand)
export class UploadAvatarImagesUseCase implements ICommandHandler<
  UploadAvatarImagesCommand,
  UploadImageProfileDto
> {
  constructor(
    @Inject(MEDIA_ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private jwt: JwtService,
    private readonly httpService: HttpService,
    private readonly coreConfig: CoreConfig,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(UploadAvatarImagesUseCase.name);
  }

  async execute(command: UploadAvatarImagesCommand) {
    const { fileStream, filename, user } = command;

    const token = this.jwt.sign({
      service: MediaAuthorizedServices.MINGLO_BLOG,
    });

    const delay = 3000;
    let firstChunk: Buffer;

    try {
      this.logger.log('take first chunk');
      firstChunk = await new Promise<Buffer>((resolve, reject) => {
        const timeout = setTimeout(() => {
          stopListening();
          reject(new Error('timeout'));
        }, delay);

        const onReadable = () => {
          stopListening();
          resolve(fileStream.read(16));
        };

        const onError = (err: Error) => {
          stopListening();
          reject(err);
        };

        const stopListening = () => {
          clearTimeout(timeout);
          fileStream.removeListener('readable', onReadable);
          fileStream.removeListener('error', onError);
        };

        fileStream.once('readable', onReadable);
        fileStream.once('error', onError);
      });
    } catch (error) {
      if (error instanceof DomainException) {
        throw error;
      }

      this.logger.error(`Stream process failed: ${error.message}`);
      fileStream.destroy();

      throw new DomainException({
        code: DomainExceptionCode.RequestTimeout,
        message: `These photos did not load within ${delay / 1000} seconds`,
      });
    }

    const type: SupportedFileType = getFileTypeFromBuffer(firstChunk);
    this.logger.log(`Detected format: ${type}`);
    fileStream.unshift(firstChunk);

    const MAX_FILE_SIZE = 3 * 1024 * 1024;
    let totalBytes = 0;

    const sizeChecker = (chunk: Buffer) => {
      totalBytes += chunk.length;

      if (totalBytes > MAX_FILE_SIZE) {
        this.logger.error('File too heavy, cutting the pipe!');

        fileStream.destroy(new Error('LIMIT_EXCEEDED'));
      }
    };

    fileStream.on('data', sizeChecker);

    const mimeTypes = {
      JPG: 'image/jpeg',
      PNG: 'image/png',
      WEBP: 'image/webp',
    };

    try {
      const formData = new FormData();

      formData.append('type', MediaType.AVATAR);
      formData.append('publicUserId', user.userId);

      formData.append('file', fileStream, {
        filename: filename,
        contentType: mimeTypes[type],
      });

      const { data } = await firstValueFrom(
        this.httpService.post(`${this.coreConfig.mediaServiceUrl}/media/upload-avatar`, formData, {
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${token}`,
          },
        }),
      );

      this.logger.log('New post image(s) uploaded');
      return data;
    } catch (error) {
      const isLimit =
        error.message === 'LIMIT_EXCEEDED' ||
        error.cause?.message === 'LIMIT_EXCEEDED' ||
        error.code === 'ECONNRESET';

      if (isLimit) {
        throw new DomainException({
          code: DomainExceptionCode.BadRequest,
          message: 'Image is too big (max 3MB)',
        });
      }
      if (error instanceof DomainException) throw error;

      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: 'Media Service is unavailable',
      });
    } finally {
      fileStream.removeListener('data', sizeChecker);
    }
  }
}
