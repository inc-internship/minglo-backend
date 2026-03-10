import { INestApplication } from '@nestjs/common';

export function proxySetup(app: INestApplication, isTrustProxyEnabled: boolean) {
  if (isTrustProxyEnabled) {
    const server = app.getHttpAdapter().getInstance();
    server.set('trust proxy', 1);
  }
}
