import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { MediaType } from '../../../../../prisma/generated/prisma/enums';
import { S3StorageService } from '../../../storage/application/services';
import { UploadParams } from '../../../storage/application/interfaces';

export class UploadImageCommand {
  constructor(
    public files: Express.Multer.File[],
    public type: MediaType,
    public publicUserId: string,
  ) {}
}

@CommandHandler(UploadImageCommand)
export class UploadImageUseCase implements ICommandHandler<UploadImageCommand, void> {
  constructor(
    private readonly storageService: S3StorageService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(UploadImageUseCase.name);
  }

  async execute({ files, type, publicUserId }: UploadImageCommand) {
    this.logger.log(`Images upload begin`, 'execute');

    const mappedFilesData = files.map((file): UploadParams => {
      return {
        buffer: file.buffer,
        mimetype: file.mimetype,
        publicUserId,
      };
    });

    //todo: добавить конвертацию изображений в webp и ресайз

    const result = await this.storageService.upload(mappedFilesData, type);
    console.table(result);
    this.logger.log(`Images upload completed, total amount: ${mappedFilesData.length}`, 'execute');
  }
}
