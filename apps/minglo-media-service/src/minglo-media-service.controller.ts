import { Controller, Get } from '@nestjs/common';
import { MingloMediaServiceService } from './minglo-media-service.service';

@Controller()
export class MingloMediaServiceController {
  constructor(private readonly mingloMediaServiceService: MingloMediaServiceService) {}

  @Get()
  getHello(): string {
    return this.mingloMediaServiceService.getHello();
  }
}
