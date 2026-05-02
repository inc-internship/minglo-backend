import { Controller } from '@nestjs/common';
import { LoggerService } from '@app/logger';

@Controller()
export class MingloPaymentsTcpController {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(MingloPaymentsTcpController.name);
  }
}
