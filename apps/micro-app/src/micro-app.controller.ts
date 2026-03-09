import { Controller, Get } from '@nestjs/common';
import { MicroAppService } from './micro-app.service';

@Controller()
export class MicroAppController {
  constructor(private readonly microAppService: MicroAppService) {}

  @Get()
  getHello(): string {
    return this.microAppService.getHello();
  }
}
