import { Injectable } from '@nestjs/common';
import { UAParser } from 'ua-parser-js';

@Injectable()
export class DeviceService {
  parse(userAgent: string) {
    const parser = new UAParser(userAgent);
    const res = parser.getResult();

    return {
      browserName: res.browser.name || 'Unknown Browser',
      browserVersion: res.browser.version || '0.0.0',
      osName: res.os.name || 'Unknown OS',
      deviceName: res.device.model || 'Desktop',
    };
  }
}
