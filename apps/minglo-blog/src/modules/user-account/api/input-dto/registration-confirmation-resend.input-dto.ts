import { ApiProperty } from '@nestjs/swagger';
import { IsValidEmail } from '@app/decorators/validation/is-valid-email.decorator';

export class RegistrationConfirmationResendInputDto {
  @ApiProperty({
    example: 'avocado@mail.com',
  })
  @IsValidEmail()
  email: string;
}
