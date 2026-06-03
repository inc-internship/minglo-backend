import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { S3StorageService } from '../../../storage/application/services';
import { MediaFileFactory } from '../../domains/factory/media-file.factory';
import { MediaMimeType, MediaType } from '@app/media/enums';
import { Readable } from 'node:stream';
import { MediaRepository } from '../../infrstructure';
import { CreateMediaFileDto } from '../../domains/dto/create-media-file.dto';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { UploadImageProfileDto } from '@app/media/dto/upload-image-profile.dto';
import sharp from 'sharp';

export class UploadAvatarImageMediaCommand {
  constructor(
    public readonly fileStream: Readable,
    public readonly publicUserId: string,
    public readonly fileType: MediaType,
  ) {}
}

@CommandHandler(UploadAvatarImageMediaCommand)
export class UploadAvatarImageMediaUseCase implements ICommandHandler<
  UploadAvatarImageMediaCommand,
  UploadImageProfileDto
> {
  constructor(
    private readonly storageService: S3StorageService,
    private readonly factory: MediaFileFactory,
    private readonly mediaRepo: MediaRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(UploadAvatarImageMediaUseCase.name);
  }

  async execute(command: UploadAvatarImageMediaCommand): Promise<UploadImageProfileDto> {
    const { fileStream, fileType, publicUserId } = command;

    // check format via magic bytes before handing off to sharp
    const firstChunk = await this.readFirstChunk(fileStream);
    this.validateImageFormat(firstChunk);
    fileStream.unshift(firstChunk);

    // clone before piping — each clone is an independent sharp pipeline
    const processor = sharp();
    const mainPipeline = processor.clone().resize(800).webp({ quality: 80 });
    const thumbPipeline = processor.clone().resize(300).webp({ quality: 60 });

    // 'info' fires when sharp flushes output, before S3 upload finishes —
    // so both are guaranteed defined when Promise.all resolves
    let mainInfo: sharp.OutputInfo | undefined;
    let thumbInfo: sharp.OutputInfo | undefined;
    mainPipeline.on('info', (info) => {
      mainInfo = info;
    });
    thumbPipeline.on('info', (info) => {
      thumbInfo = info;
    });

    // pipe before adding any 'data' listeners, otherwise stream goes flowing and drops chunks
    fileStream.pipe(processor);

    // pipe() doesn't forward errors, so destroy pipelines manually on failure
    const onStreamError = (err: Error) => {
      mainPipeline.destroy(err);
      thumbPipeline.destroy(err);
      processor.destroy(err);
    };
    fileStream.on('error', onStreamError);

    try {
      this.logger.log(`Starting parallel S3 upload for user: ${publicUserId}`);

      const [mainRes, thumbRes] = await Promise.all([
        this.storageService.uploadStream(fileType, publicUserId, mainPipeline),
        this.storageService.uploadStream(fileType, publicUserId, thumbPipeline),
      ]);

      if (!mainRes.url || !thumbRes.url) {
        throw new DomainException({
          code: DomainExceptionCode.InternalServerError,
          message: 'File upload failed: storage provider did not return file location',
        });
      }

      const mainDto: CreateMediaFileDto = {
        publicUserId,
        type: MediaType.AVATAR,
        mimeType: MediaMimeType.IMAGE_WEBP,
        url: mainRes.url,
        key: mainRes.key,
        width: mainInfo!.width,
        height: mainInfo!.height,
        fileSize: mainRes.fileSize,
      };

      const thumbDto: CreateMediaFileDto = {
        publicUserId,
        type: MediaType.AVATAR,
        mimeType: MediaMimeType.IMAGE_WEBP,
        url: thumbRes.url,
        key: thumbRes.key,
        width: thumbInfo!.width,
        height: thumbInfo!.height,
        fileSize: thumbRes.fileSize,
      };

      const [originalId, thumbnailId] = await this.mediaRepo.createMany([
        this.factory.create(mainDto),
        this.factory.create(thumbDto),
      ]);

      this.logger.log(`Avatar saved: original=${originalId}, thumbnail=${thumbnailId}`);

      return {
        original: {
          id: originalId,
          url: mainRes.url,
          key: mainRes.key,
          width: mainInfo!.width,
          height: mainInfo!.height,
          fileSize: mainRes.fileSize,
          mimeType: MediaMimeType.IMAGE_WEBP,
        },
        thumbnail: {
          id: thumbnailId,
          url: thumbRes.url,
          key: thumbRes.key,
          width: thumbInfo!.width,
          height: thumbInfo!.height,
          fileSize: thumbRes.fileSize,
          mimeType: MediaMimeType.IMAGE_WEBP,
        },
      };
    } finally {
      fileStream.removeListener('error', onStreamError);
    }
  }

  /** Peeks at the first N bytes; pushes them back via unshift() so the stream stays intact. */
  private readFirstChunk(stream: Readable, size = 16): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        stream.removeListener('readable', onReadable);
        stream.removeListener('error', onError);
        reject(
          new DomainException({
            code: DomainExceptionCode.RequestTimeout,
            message: 'File upload timed out',
          }),
        );
      }, 5000);

      const onReadable = () => {
        clearTimeout(timeout);
        stream.removeListener('error', onError);
        const chunk = stream.read(size);
        if (chunk) {
          resolve(chunk);
        } else {
          reject(
            new DomainException({
              code: DomainExceptionCode.BadRequest,
              message: 'File is empty',
            }),
          );
        }
      };

      const onError = (err: Error) => {
        clearTimeout(timeout);
        stream.removeListener('readable', onReadable);
        reject(err);
      };

      stream.once('readable', onReadable);
      stream.once('error', onError);
    });
  }

  /** Checks magic bytes to verify the format — file extensions can't be trusted. */
  private validateImageFormat(chunk: Buffer): void {
    if (!chunk || chunk.length < 12) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'File is too small or empty',
      });
    }

    const isJpg = chunk[0] === 0xff && chunk[1] === 0xd8 && chunk[2] === 0xff;
    if (isJpg) return;

    const isPng = chunk
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    if (isPng) return;

    const isWebp =
      chunk.toString('ascii', 0, 4) === 'RIFF' && chunk.toString('ascii', 8, 12) === 'WEBP';
    if (isWebp) return;

    throw new DomainException({
      code: DomainExceptionCode.BadRequest,
      message: 'Unsupported image format. Allowed: JPG, PNG, WEBP',
    });
  }
}
