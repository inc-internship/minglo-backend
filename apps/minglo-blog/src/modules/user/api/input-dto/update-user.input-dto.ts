import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserInputDto {
  @ApiProperty()
  @IsString()
  email: string;
}
