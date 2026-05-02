import { Controller, Get } from '@nestjs/common';
import { LoggerService } from '@app/logger';

@Controller()
export class MingloPaymentsController {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(MingloPaymentsController.name);
  }

  @Get('plans')
  getHello(): string {
    return '<h1 style="color: red;">Hello form Minglo Payments Service!</h1>';
  }
}
