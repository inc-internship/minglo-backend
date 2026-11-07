import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStripeCheckoutInputDto {
  @ApiProperty({ description: 'plan ID', example: 'clxyz123...' })
  @IsString()
  @IsNotEmpty()
  planId: string;
}
