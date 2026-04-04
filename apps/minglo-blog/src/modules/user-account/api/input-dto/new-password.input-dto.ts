import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';
import { emailConfirmationConstraints, passwordConstraints } from '../../domains';
import { IsValidPassword } from '@app/decorators';

export class NewPasswordInputDto {
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
  newPassword: string;

  @ApiProperty({
    minLength: emailConfirmationConstraints.min,
    maxLength: emailConfirmationConstraints.max,
    example: 'b489bca8-98f3-453f-95cd-1170a018755b',
  })
  @IsString()
  @IsUUID()
  recoveryCode: string;
}
