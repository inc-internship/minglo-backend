import { Controller, Delete, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { ConsumeMediaFilesInputDto, MarkMediaFilesDeletedInputDTO } from './input-dto';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MediaFileMetaDataViewDto } from './view-dto';
import { MarkDeletedResultViewDto } from './view-dto/mark-deleted-result.view-dto';

@Controller()
@ApiTags('Media TCP')
export class SwaggerMediaTcpController {
  @Post()
  @ApiOperation({
    summary: 'TCP: consume_media_files',
    description: `Used by Posts module during post creation flow. Consumes uploaded media files: 
    \n- Validates ownership (publicUserId)
    \n- Ensures files are not used before (usedAt = null)
    \n- Marks files as used (sets usedAt)
    \n- Returns metadata required for PostImage creation
  `,
  })
  @ApiBody({ type: ConsumeMediaFilesInputDto })
  @HttpCode(HttpStatus.OK)
  async consumeMediaFiles(
    @Payload() dto: ConsumeMediaFilesInputDto,
  ): Promise<MediaFileMetaDataViewDto[]> {
    console.log(dto);
    return [];
  }

  @Delete()
  @ApiOperation({
    summary: 'TCP: mark_media_files_deleted',
    description: `Used by Posts module when a post is deleted. Performs soft delete of media files:
    \n- Sets deletedAt timestamp
    \n- Does NOT delete files from S3 immediately
    \n- Actual S3 deletion is handled later by a scheduled cron job
  `,
  })
  @ApiBody({ type: MarkMediaFilesDeletedInputDTO })
  @HttpCode(HttpStatus.OK)
  async markMediaFilesDeleted(
    @Payload() dto: MarkMediaFilesDeletedInputDTO,
  ): Promise<MarkDeletedResultViewDto> {
    console.log(dto);
    return { success: true };
  }
}
