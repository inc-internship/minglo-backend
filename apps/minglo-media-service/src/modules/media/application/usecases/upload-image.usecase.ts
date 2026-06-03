import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { S3StorageService } from '../../../storage/application/services';
import { ImageProcessorService } from '../services';
import { MediaRepository } from '../../infrstructure/media.repository';
import { MediaFileFactory } from '../../domains/factory/media-file.factory';
import { MediaType } from '@app/media/enums';
import { UploadImageResultDto } from '@app/media/dto';

export class UploadImageCommand {
  constructor(
    public files: Express.Multer.File[],
    public type: MediaType,
    public publicUserId: string,
  ) {}
}

@CommandHandler(UploadImageCommand)
export class UploadImageUseCase implements ICommandHandler<
  UploadImageCommand,
  UploadImageResultDto
> {
  constructor(
    private readonly storageService: S3StorageService,
    private readonly imageProcessor: ImageProcessorService,
    private readonly factory: MediaFileFactory,
    private readonly mediaRepo: MediaRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(UploadImageUseCase.name);
  }

  async execute({ files, type, publicUserId }: UploadImageCommand): Promise<UploadImageResultDto> {
    this.logger.log(`Images conversion begin`, 'execute');

    const { convertedImages, failedCount: convertFailedCount } =
      await this.imageProcessor.resizeAndConvertToWebpMany({
        files,
      });

    this.logger.log(`Images upload to S3 begin`, 'execute');

    const { uploadedImages, failedCount: uploadFailedCount } = await this.storageService.uploadMany(
      {
        images: convertedImages,
        type,
        publicUserId,
      },
    );

    const entities = uploadedImages.map((i) => {
      return this.factory.create(i);
    });

    const ids = await this.mediaRepo.createMany(entities);
    const failedCount = convertFailedCount + uploadFailedCount;

    this.logger.log(`Images saved to Media database`, 'execute');
    this.logger.log(`Upload images to S3 finished`, 'execute');

    return {
      ids,
      failedCount,
    };
  }
}
