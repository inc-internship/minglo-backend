import { IsString } from 'class-validator';

export class UpdateUserInputDto {
  @IsString()
  email: string;
}
