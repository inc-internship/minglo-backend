import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { S3StorageService } from '../../../storage/application/services';
import { MediaFileFactory } from '../../domains/factory/media-file.factory';
import { MediaMimeType, MediaType } from '@app/media/enums';
import { Readable } from 'node:stream';
import { WorkerPoolService } from '../workers/worker-pool.service';
import { MediaRepository } from '../../infrstructure';
import { CreateMediaFileDto } from '../../domains/dto/create-media-file.dto';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { UploadImageProfileDto } from '@app/media/dto/upload-image-profile.dto';

export class UploadAvatarImageMediaCommand {
  constructor(
    public readonly fileStream: Readable,
    public fileType: MediaType,
    public publicUserId: string,
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
    private readonly workerPoolService: WorkerPoolService,
  ) {
    this.logger.setContext(UploadAvatarImageMediaUseCase.name);
  }

  async execute(command: UploadAvatarImageMediaCommand) {
    const { fileStream, fileType, publicUserId } = command;

    this.logger.log(`stream begin resize in worker`, 'execute');
    const { main, thumb } = await this.workerPoolService.processImage(fileStream);

    const [mainRes, thumbRes] = await Promise.all([
      this.storageService.uploadStream(fileType, publicUserId, main),
      this.storageService.uploadStream(fileType, publicUserId, thumb),
    ]);
    this.logger.log(`Images upload to S3 begin`, 'execute');

    if (!mainRes.url || !thumbRes.url) {
      this.logger.error('S3 returned empty data', 'execute');
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: 'File upload failed: storage provider did not return file location',
      });
    }

    const mainDto: CreateMediaFileDto = {
      publicUserId: command.publicUserId,
      type: MediaType.AVATAR,
      mimeType: MediaMimeType.IMAGE_WEBP,
      url: mainRes.url,
      key: mainRes.key,
      width: 800,
      height: 800,
      fileSize: mainRes.fileSize,
    };

    const thumbDto: CreateMediaFileDto = {
      ...mainDto,
      url: thumbRes.url,
      key: thumbRes.key,
      width: 300,
      height: 300,
      fileSize: thumbRes.fileSize,
    };

    const entities = [this.factory.create(mainDto), this.factory.create(thumbDto)];
    const [mainId, thumbId] = await this.mediaRepo.createMany(entities);

    this.logger.log(`Images saved to Media database`, 'execute');
    this.logger.log(`Upload images to S3 finished`, 'execute');

    return {
      mainImage: { id: mainId, url: mainRes.url },
      thumbnail: { id: thumbId, url: thumbRes.url },
    };
  }
}
