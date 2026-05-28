import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class MarkMediaFilesDeletedInputDTO {
  @ApiProperty({
    description: 'Key for media file in bucket on S3',
    example: ['some/key/to/image/in/bucket'],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  keys: string[];
}
