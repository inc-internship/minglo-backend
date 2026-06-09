import { Controller, Headers, HttpCode, HttpStatus, Inject, Post, RawBody } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { LoggerService } from '@app/logger';
import { PAYMENT_SERVICE, PAYMENTS_TCP_PATTERNS } from '@app/payments';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller('internal/stripe')
export class StripeWebhookController {
  constructor(
    @Inject(PAYMENT_SERVICE) private readonly paymentClient: ClientProxy,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(StripeWebhookController.name);
  }

  @Post('webhook')
  @ApiExcludeEndpoint()
  @HttpCode(HttpStatus.OK)
  handleWebhook(
    @RawBody() rawBody: Buffer,
    @Headers('stripe-signature') signature: string,
  ): { received: true } {
    this.logger.log('Stripe webhook received, forwarding to payments-service', 'handleWebhook');

    this.paymentClient
      .emit(PAYMENTS_TCP_PATTERNS.STRIPE_WEBHOOK, {
        rawBodyBase64: rawBody.toString('base64'),
        signature,
      })
      .subscribe();

    return { received: true };
  }
}
