import { ApiProperty } from '@nestjs/swagger';
import { MediaType } from '../../../../../apps/minglo-media-service/prisma/generated/prisma/enums';
import { IsEnum } from 'class-validator';

export class MediaTypeInputDto {
  @ApiProperty({
    enum: MediaType,
    enumName: 'MediaType',
  })
  @IsEnum(MediaType)
  type: MediaType;
}
