import { ApiProperty } from '@nestjs/swagger';

export class CreateStripeCheckoutViewDto {
  @ApiProperty({ example: 'https://checkout.stripe.com/pay/cs_test_...', type: String })
  checkoutUrl: string;
}
