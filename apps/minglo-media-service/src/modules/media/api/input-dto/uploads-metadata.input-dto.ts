import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from 'class-validator';

export class UploadsMetadataInputDto {
  @ApiProperty({
    description: 'List of uploaded image IDs',
    example: ['uploadId1', 'uploadId2'],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  uploadIds: string[];

  @ApiProperty({
    description: 'Public user ID who owns uploads',
    example: 'some_user_id',
  })
  @IsString()
  @IsNotEmpty()
  publicUserId: string;
}
