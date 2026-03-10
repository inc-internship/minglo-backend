import { Injectable } from '@nestjs/common';

@Injectable()
export class MicroAppService {
  getHello(): string {
    return 'Hello World!';
  }
}
