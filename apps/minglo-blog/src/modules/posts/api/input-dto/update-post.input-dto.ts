import { IsString, MaxLength, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { createPostConstraints } from '../../domains/constraints';

export class UpdatePostInputDto {
  @ApiProperty({
    description: 'Post text content ot null',
    maxLength: createPostConstraints.description.maxLength,
    nullable: true,
    example: 'My trip to Lisbon in Portugal',
  })
  @ValidateIf((o) => o.description !== null)
  @IsString()
  @MaxLength(createPostConstraints.description.maxLength)
  description: string | null;
}
