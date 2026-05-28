import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Trim } from '@app/decorators';

export class GetUserPostsQueryInputDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Trim()
  cursor?: string;
}
