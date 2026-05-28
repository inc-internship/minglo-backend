import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAvatarInputDto {
  @ApiProperty({
    description: 'List of uploadIds returned from /media/upload-image.',
    type: [String],
    example: ['upload_id_1', 'upload_id_2'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  uploadIds: string[];
}
