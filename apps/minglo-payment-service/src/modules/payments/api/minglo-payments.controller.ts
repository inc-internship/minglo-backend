import { Controller, Get } from '@nestjs/common';
import { LoggerService } from '@app/logger';

@Controller('internal')
export class MingloPaymentsController {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(MingloPaymentsController.name);
  }

  @Get()
  getHello(): string {
    return 'Hello form Minglo Payments Service!';
  }
}
