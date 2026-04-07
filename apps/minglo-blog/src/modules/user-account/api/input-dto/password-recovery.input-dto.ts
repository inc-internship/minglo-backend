import { ApiProperty } from '@nestjs/swagger';
import { IsValidEmail } from '@app/decorators/validation/is-valid-email.decorator';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class PasswordRecoveryInputDto {
  @ApiProperty({
    example: 'avocado@mail.com',
  })
  @IsValidEmail()
  email: string;

  @ApiProperty({
    description: 'The confirmation link in the email will point to this address.',
    example: 'https://minglo.blog/example-path',
  })
  @IsUrl()
  redirectUrl: string;

  @IsString()
  @IsNotEmpty()
  captchaValue: string;
}
