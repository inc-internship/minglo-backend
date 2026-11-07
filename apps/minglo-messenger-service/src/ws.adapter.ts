import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplication } from '@nestjs/common';
import { ServerOptions } from 'socket.io';
import { MessengerConfig } from './core/messenger.config';

export class WsMessengerAdapter extends IoAdapter {
  private readonly corsOptions: ServerOptions['cors'];

  constructor(app: INestApplication) {
    super(app);
    const config = app.get(MessengerConfig);

    this.corsOptions = config.cors
      ? { origin: config.corsOrigins, credentials: config.corsCredentials }
      : undefined;
  }

  createIOServer(port: number, options?: ServerOptions) {
    return super.createIOServer(port, { ...options, cors: this.corsOptions });
  }
}
