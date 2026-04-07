import { Injectable } from '@nestjs/common';

//todo: check and delete ?
@Injectable()
export class MediaService {
  getHello(): string {
    return 'Minglo-media-service Hello World!';
  }
}
