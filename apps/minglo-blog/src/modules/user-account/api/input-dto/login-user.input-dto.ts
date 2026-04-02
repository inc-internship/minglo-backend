import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginUserInputDto {
  @ApiProperty({ example: 'Qwerty123!' })
  @IsString()
  password: string;

  @ApiProperty({ example: 'avocado@mail.com', format: 'email' })
  @IsString()
  email: string;
}
