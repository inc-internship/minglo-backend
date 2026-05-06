import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { MediaType } from '@app/media/enums';

export class MediaTypeInputDto {
  @ApiProperty({
    enum: MediaType,
    enumName: 'MediaType',
  })
  @IsEnum(MediaType)
  type: MediaType;

  @ApiProperty()
  @IsNotEmpty()
  publicUserId: string;
}
