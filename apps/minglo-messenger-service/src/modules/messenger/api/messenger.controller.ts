import { Controller, Get } from '@nestjs/common';
import { MessengerService } from '../application/services/messenger.service';

@Controller()
export class MessengerController {
  constructor(private readonly mingloMessengerServiceService: MessengerService) {}

  @Get()
  getHello(): string {
    return this.mingloMessengerServiceService.getHello();
  }
}
