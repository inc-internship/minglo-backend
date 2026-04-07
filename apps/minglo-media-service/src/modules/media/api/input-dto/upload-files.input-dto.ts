import { ApiProperty } from '@nestjs/swagger';

export class UploadFilesInputDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    isArray: true,
    minItems: 1,
    maxItems: 10,
  })
  files: Express.Multer.File[];
}
