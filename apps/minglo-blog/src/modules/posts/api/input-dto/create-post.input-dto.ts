import { ArrayNotEmpty, IsArray, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { createPostConstraints } from '../../domains/constraints';

export class CreatePostInputDto {
  @ApiPropertyOptional({
    description: 'Post text content. Optional. If not provided, post will contain only images.',
    maxLength: createPostConstraints.description.maxLength,
    example: 'My trip to Lisbon in Portugal',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'List of uploadIds returned from /media/upload-image.',
    type: [String],
    minItems: createPostConstraints.uploadIds.minItems,
    maxItems: createPostConstraints.uploadIds.maxItems,
    example: ['upload_id_1', 'upload_id_2'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  uploadIds: string[];
}
