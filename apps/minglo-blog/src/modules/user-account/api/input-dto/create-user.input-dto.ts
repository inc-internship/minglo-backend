import { ApiProperty } from '@nestjs/swagger';
import { IsValidLogin, IsValidPassword } from '@app/decorators';
import { IsValidEmail } from '@app/decorators/validation/is-valid-email.decorator';
import { loginConstraints, passwordConstraints } from '../../domains/constraints';

//todo: добавить nest i18n
const validationMessages = {
  login: 'Login can only contain letters, numbers, "_" and "-"',
  password:
    'Password must contain at least one digit, one uppercase letter, one lowercase letter; special characters are optional',
};

export class CreateUserInputDto {
  @ApiProperty()
  @IsValidLogin({
    min: loginConstraints.min,
    max: loginConstraints.max,
    regex: loginConstraints.regex,
    regexMessage: validationMessages.login,
  })
  login: string;

  @ApiProperty()
  @IsValidPassword({
    min: passwordConstraints.min,
    max: passwordConstraints.max,
    regex: passwordConstraints.regex,
    regexMessage: validationMessages.password,
  })
  password: string;

  @ApiProperty()
  @IsValidEmail()
  email: string;
}
