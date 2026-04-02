import { ApiProperty } from '@nestjs/swagger';

export class LoginUserInputDto {
  @ApiProperty({ example: 'Qwerty123!' })
  password: string;

  @ApiProperty({ example: 'avocado@mail.com', format: 'email' })
  email: string;
}
