import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiCreateStripeCheckout() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create Stripe Checkout session',
      description:
        'Creates a Stripe Checkout Session for a one-time payment. Returns a redirect URL to the Stripe-hosted payment page.',
    }),
    ApiBearerAuth('access-token'),
    ApiCreatedResponse({
      description: 'Checkout session created. Redirect user to checkoutUrl.',
      schema: {
        type: 'object',
        properties: {
          checkoutUrl: {
            type: 'string',
            example: 'https://checkout.stripe.com/c/pay/...',
          },
        },
      },
    }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiTooManyRequestsResponse({
      description: 'Too many attempts from the same IP address. Please try again later.',
    }),
  );
}
