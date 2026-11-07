import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class SearchUsersQueryInputDto {
  @ApiProperty({ description: 'Username to search (partial match)' })
  @IsString()
  @MinLength(1)
  username: string;

  @ApiPropertyOptional({ description: 'Cursor for pagination' })
  @IsOptional()
  @IsString()
  cursor?: string;
}