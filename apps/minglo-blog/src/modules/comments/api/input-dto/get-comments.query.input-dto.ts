import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetCommentsQueryInputDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cursor?: string;
}