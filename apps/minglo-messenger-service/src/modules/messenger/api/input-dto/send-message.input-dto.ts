import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SendMessageInputDto {
  @ApiProperty({ maxLength: 3000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(3000)
  text: string;
}
