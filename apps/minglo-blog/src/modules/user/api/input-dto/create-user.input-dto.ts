import { IsString } from 'class-validator';

export class CreateUserInputDto {
  @IsString()
  login: string;

  @IsString()
  password: string;

  @IsString()
  email: string;
}
