import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UploadsMetadataInputDto } from './input-dto/uploads-metadata.input-dto';
import { LoggerService } from '@app/logger';
import { QueryBus } from '@nestjs/cqrs';
import { MediaFileMetaDataViewDto } from './view-dto';
import { GetMediaFilesMetaDataQuery } from '../application/queries';

@Controller()
export class MediaTcpController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(MediaTcpController.name);
  }

  /**
   * TCP: Returns media metadata for given upload IDs.
   * Used by Posts module during post creation.
   */
  @MessagePattern({ cmd: 'get_media_files_metadata' })
  async getMediaFilesMetadata(
    @Payload() dto: UploadsMetadataInputDto,
  ): Promise<MediaFileMetaDataViewDto[]> {
    const { publicUserId, uploadIds } = dto;

    this.logger.log(
      `get-uploads-meta start user: ${publicUserId} | uploadIds count=${uploadIds.length}`,
    );

    return this.queryBus.execute<GetMediaFilesMetaDataQuery, MediaFileMetaDataViewDto[]>(
      new GetMediaFilesMetaDataQuery(publicUserId, uploadIds),
    );
  }
}
