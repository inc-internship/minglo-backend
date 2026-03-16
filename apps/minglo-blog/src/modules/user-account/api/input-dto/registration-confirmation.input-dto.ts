import { ApiProperty } from '@nestjs/swagger';
import { emailConfirmationConstraints } from '../../domains';
import { IsString, IsUUID } from 'class-validator';

export class RegistrationConfirmationInputDto {
  @ApiProperty({
    minLength: emailConfirmationConstraints.min,
    maxLength: emailConfirmationConstraints.max,
    example: 'b489bca8-98f3-453f-95cd-1170a018755b',
  })
  @IsString()
  @IsUUID()
  code: string;
}
