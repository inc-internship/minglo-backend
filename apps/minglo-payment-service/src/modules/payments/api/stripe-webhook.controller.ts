import { Controller, Headers, HttpCode, HttpStatus, Post, RawBody } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { StripeWebhookCommand } from '../application/usecases';
import { ApiStripeWebhook } from '../../../core/decorators/swagger/payments';
import { StripeWebhookResponse } from '../application/interfaces';

@Controller('internal/stripe')
export class StripeWebhookController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(StripeWebhookController.name);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiStripeWebhook()
  async handleWebhook(
    @RawBody() rawBody: Buffer, // must be raw body for signature verification!
    @Headers('stripe-signature') signature: string,
  ): Promise<StripeWebhookResponse> {
    this.logger.log(`Stripe webhook received`, 'handleWebhook');

    try {
      await this.commandBus.execute(new StripeWebhookCommand(rawBody, signature));
    } catch (err) {
      // only logs, avoid Stripe retries in current mvp
      this.logger.error(
        `Webhook processing error: ${(err as Error).message}, ${err as Error}.stack`,
        'handleWebhook',
      );
    }

    return { received: true };
  }
}
