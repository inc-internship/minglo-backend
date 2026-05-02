import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { LoggerService } from '@app/logger';

@Controller('billing')
export class BillingController {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(BillingController.name);
  }

  @Get('plans')
  @HttpCode(HttpStatus.OK)
  async getPlans(): Promise<string> {
    //todo: fix any type
    //todo: add swagger decorator
    return 'this.paymentsClient.getPlans()';
  }
}
