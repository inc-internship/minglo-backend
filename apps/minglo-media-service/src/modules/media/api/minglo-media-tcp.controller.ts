import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ConsumeMediaFilesInputDto, MarkMediaFilesDeletedInputDTO } from './input-dto';
import { LoggerService } from '@app/logger';
import { CommandBus } from '@nestjs/cqrs';
import { MediaFileMetaDataViewDto } from './view-dto';
import { ConsumeMediaFilesUsecase, MarkMediaFilesDeletedCommand } from '../application/usecases';
import { MarkDeletedResultViewDto } from './view-dto/mark-deleted-result.view-dto';

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
    @Payload() dto: ConsumeMediaFilesInputDto,
  ): Promise<MediaFileMetaDataViewDto[]> {
    const { publicUserId, uploadIds } = dto;

    this.logger.log(
      `consume_media_files start user: ${publicUserId} | uploadIds count=${uploadIds.length}`,
    );

    return this.commandBus.execute<ConsumeMediaFilesUsecase, MediaFileMetaDataViewDto[]>(
      new ConsumeMediaFilesUsecase(publicUserId, uploadIds),
    );
  }

  /**
   * Soft-deletes media files by provided keys via command bus.
   * Used by Posts module during post deletion flow.
   */
  @MessagePattern({ cmd: 'mark_media_files_deleted' })
  async markMediaFilesDeleted(
    @Payload() dto: MarkMediaFilesDeletedInputDTO,
  ): Promise<MarkDeletedResultViewDto> {
    const { keys } = dto;

    this.logger.log(`mark_media_files_deleted start, requested keys: ${keys.join(', ')}`);

    await this.commandBus.execute<MarkMediaFilesDeletedCommand, void>(
      new MarkMediaFilesDeletedCommand(keys),
    );

    return { success: true };
  }
}
