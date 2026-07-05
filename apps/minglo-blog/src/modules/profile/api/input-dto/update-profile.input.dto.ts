import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length, MaxLength } from 'class-validator';
import { IsBirthdayValid, IsValidLogin } from '@app/decorators';
import { loginConstraints } from '../../../user-account/domains';

export class UpdateProfileInputDto {
  @ApiProperty({
    required: false,
    minLength: loginConstraints.min,
    maxLength: loginConstraints.max,
    pattern: loginConstraints.regex.source,
    example: 'new_login',
  })
  @IsOptional()
  @IsValidLogin({
    min: loginConstraints.min,
    max: loginConstraints.max,
    regex: loginConstraints.regex,
    regexMessage: 'Login can only contain letters, numbers, "_" and "-"',
  })
  login?: string;

  @ApiProperty({ required: false, example: 'Ivan' })
  @IsOptional()
  @IsString()
  @Length(1, 25)
  firstName?: string;

  @ApiProperty({ required: false, example: 'Ivanov' })
  @IsOptional()
  @IsString()
  @Length(1, 25)
  lastName?: string;

  @ApiProperty({ required: false, example: '2000-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsBirthdayValid()
  birthday?: string;

  @ApiProperty({ required: false, example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  countryId?: string;

  @ApiProperty({ required: false, example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  cityId?: string;

  @ApiProperty({ required: false, example: 'Backend developer' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  aboutMe?: string;
}
