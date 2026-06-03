import { Controller, Get } from '@nestjs/common';
import { LoggerService } from '@app/logger';

@Controller('billing')
export class BillingController {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(BillingController.name);
  }

  @Get()
  async helloBilling(): Promise<string> {
    this.logger.log(`Get Hello billing request received`, 'helloBilling');
    return 'Hello from Billing Controller';
  }
}
