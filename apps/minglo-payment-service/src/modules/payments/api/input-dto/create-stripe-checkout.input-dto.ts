import { IsNotEmpty, IsString } from 'class-validator';

export class CreateStripeCheckoutInputDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  planId: string;
}
