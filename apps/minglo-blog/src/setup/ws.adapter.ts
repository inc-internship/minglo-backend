import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplication } from '@nestjs/common';
import { ServerOptions } from 'socket.io';
import { CoreConfig } from '../core/core.config';

export class WsAdapter extends IoAdapter {
  private readonly corsOptions: ServerOptions['cors'];

  constructor(app: INestApplication) {
    super(app);
    const coreConfig = app.get(CoreConfig);

    this.corsOptions = coreConfig.cors
      ? { origin: coreConfig.corsOrigins, credentials: coreConfig.corsCredentials }
      : undefined;
  }

  createIOServer(port: number, options?: ServerOptions) {
    return super.createIOServer(port, { ...options, cors: this.corsOptions });
  }
}
