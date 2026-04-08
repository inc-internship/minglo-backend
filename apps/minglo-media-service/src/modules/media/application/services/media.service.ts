import { Injectable } from '@nestjs/common';

@Injectable()
export class MediaService {
  getHello(): string {
    return 'Minglo-media-service Hello World!';
  }
}
