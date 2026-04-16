import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UploadsMetadataInputDto } from './input-dto/uploads-metadata.input-dto';
import { LoggerService } from '@app/logger';
import { CommandBus } from '@nestjs/cqrs';
import { MediaFileMetaDataViewDto } from './view-dto';
import { ConsumeMediaFilesCommand } from '../application/usecases';

@Controller()
export class MediaTcpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(MediaTcpController.name);
  }

  /**
   * Consumes media files by upload IDs:
   * Used by Posts module during post creation flow.
   * Returns metadata for uploaded media files.
   */
  @MessagePattern({ cmd: 'consume_media_files' })
  async consumeMediaFiles(
    @Payload() dto: UploadsMetadataInputDto,
  ): Promise<MediaFileMetaDataViewDto[]> {
    const { publicUserId, uploadIds } = dto;

    this.logger.log(
      `consume_media_files start user: ${publicUserId} | uploadIds count=${uploadIds.length}`,
    );

    return this.commandBus.execute<ConsumeMediaFilesCommand, MediaFileMetaDataViewDto[]>(
      new ConsumeMediaFilesCommand(publicUserId, uploadIds),
    );
  }
}
