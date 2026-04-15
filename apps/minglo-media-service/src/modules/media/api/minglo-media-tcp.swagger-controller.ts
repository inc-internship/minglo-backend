import { Controller, Get } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { UploadsMetadataInputDto } from './input-dto/uploads-metadata.input-dto';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MediaFileMetaDataViewDto } from './view-dto';

@Controller()
@ApiTags('Media TCP')
export class SwaggerMediaTcpController {
  @Get()
  @ApiOperation({ summary: 'TCP: get_media_files_metadata' })
  @ApiBody({ type: UploadsMetadataInputDto })
  async getUploadsMetadata(
    @Payload() dto: UploadsMetadataInputDto,
  ): Promise<MediaFileMetaDataViewDto[]> {
    console.log(dto);
    return [];
  }
}
