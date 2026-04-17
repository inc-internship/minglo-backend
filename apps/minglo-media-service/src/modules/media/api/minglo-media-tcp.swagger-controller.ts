import { Controller, Post } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { ConsumeMediaFilesInputDto } from './input-dto/consume-media-files-input.dto';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MediaFileMetaDataViewDto } from './view-dto';

@Controller()
@ApiTags('Media TCP')
export class SwaggerMediaTcpController {
  @Post()
  @ApiOperation({
    summary: 'TCP: consume_media_files',
    description:
      ' Used by Posts module during post creation flow. Returns metadata for uploaded media files.',
  })
  @ApiBody({ type: ConsumeMediaFilesInputDto })
  async getUploadsMetadata(
    @Payload() dto: ConsumeMediaFilesInputDto,
  ): Promise<MediaFileMetaDataViewDto[]> {
    console.log(dto);
    return [];
  }
}
