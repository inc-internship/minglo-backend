import { Injectable } from '@nestjs/common';

@Injectable()
export class MingloMediaServiceService {
  getHello(): string {
    return 'Minglo-media-service Hello World!';
  }
}
