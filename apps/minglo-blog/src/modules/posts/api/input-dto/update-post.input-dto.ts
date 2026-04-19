import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { createPostConstraints } from '../../domains/constraints';

export class UpdatePostInputDto {
  @ApiPropertyOptional({
    description: 'Post text content',
    maxLength: createPostConstraints.description.maxLength,
    example: 'My trip to Lisbon in Portugal',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description: string | null;
}
