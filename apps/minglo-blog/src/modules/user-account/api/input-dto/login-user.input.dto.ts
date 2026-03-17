import { ApiProperty } from '@nestjs/swagger';
import { passwordConstraints } from '../../domains';
import { IsValidPassword } from '@app/decorators';
import { IsValidEmail } from '@app/decorators/validation/is-valid-email.decorator';

export class LoginUserInputDto {
  @ApiProperty({
    minLength: passwordConstraints.min,
    maxLength: passwordConstraints.max,
    pattern: passwordConstraints.regex.source,
    example: 'Qwerty123!',
  })
  @IsValidPassword({
    min: passwordConstraints.min,
    max: passwordConstraints.max,
    regex: passwordConstraints.regex,
    regexMessage:
      'Password must contain at least ' +
      'one digit, ' +
      'one uppercase letter, ' +
      'one lowercase letter; ' +
      'special characters (optional)',
  })
  password: string;

  @ApiProperty({
    example: 'avocado@mail.com',
    format: 'email',
  })
  @IsValidEmail()
  email: string;
}
