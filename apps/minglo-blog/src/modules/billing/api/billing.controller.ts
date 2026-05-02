import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { LoggerService } from '@app/logger';
import { PaymentsHttpClient } from '../infrastructure/payments-http.client';

@Controller('billing')
export class BillingController {
  constructor(
    private readonly paymentsClient: PaymentsHttpClient,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(BillingController.name);
  }

  @Get('plans')
  @HttpCode(HttpStatus.OK)
  getPlans(): Promise<any> {
    //todo: fix any type
    //todo: add swagger decorator
    return this.paymentsClient.getPlans();
  }
}
