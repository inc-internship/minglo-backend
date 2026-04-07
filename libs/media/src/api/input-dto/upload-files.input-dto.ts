import { ApiProperty } from '@nestjs/swagger';
import { MediaType } from '../../../../../apps/minglo-media-service/prisma/generated/prisma/enums';
import { IsEnum } from 'class-validator';

//todo: delete input-dto
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

export class MediaTypeInputDto {
  @ApiProperty({
    enum: MediaType,
    enumName: 'MediaType',
  })
  @IsEnum(MediaType)
  type: MediaType;
}
