import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiHeader, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

export function ApiStripeWebhook() {
  return applyDecorators(
    ApiOperation({
      summary: 'Stripe webhook receiver',
      description:
        'Called by Stripe directly (not by frontend). Forwards raw payload to payments-service via TCP for signature verification and processing. ' +
        'Always returns 200 immediately — Stripe retries on 4xx/5xx for up to 3 days.',
    }),
    ApiHeader({
      name: 'stripe-signature',
      description:
        'Stripe HMAC-SHA256 signature (t=...,v1=...). For Swagger testing enter any value.',
      required: true,
      example: 't=1234567890,v1=abc123',
    }),
    ApiBody({
      description: 'Raw Stripe event payload (sent by Stripe, not manually).',
      schema: { type: 'object', example: { type: 'checkout.session.completed' } },
    }),
    ApiOkResponse({
      description: 'Webhook received (always 200)',
      schema: { type: 'object', properties: { received: { type: 'boolean', example: true } } },
    }),
  );
}
