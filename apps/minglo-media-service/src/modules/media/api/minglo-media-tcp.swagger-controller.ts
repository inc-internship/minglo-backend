import { Controller, Post } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { UploadsMetadataInputDto } from './input-dto/uploads-metadata.input-dto';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MediaFileMetaDataViewDto } from './view-dto';

@Controller()
@ApiTags('Media TCP')
export class SwaggerMediaTcpController {
  @Post()
  @ApiOperation({ summary: 'TCP: consume_media_files' })
  @ApiBody({ type: UploadsMetadataInputDto })
  async getUploadsMetadata(
    @Payload() dto: UploadsMetadataInputDto,
  ): Promise<MediaFileMetaDataViewDto[]> {
    console.log(dto);
    return [];
  }
}
