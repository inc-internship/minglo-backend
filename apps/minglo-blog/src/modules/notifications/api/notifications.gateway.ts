import { OnGatewayConnection, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Namespace, Socket } from 'socket.io';
import { UserConfig } from '../../../core/user.config';
import { NotificationViewDto } from './view-dto/notification.view-dto';
import { WS_EVENTS } from '../../../shared/enums';
import { LoggerService } from '@app/logger';
import { SessionRepository } from '../../user-account/infrastructure/session.repository';

@WebSocketGateway({ namespace: '/notifications' })
@Injectable()
export class NotificationsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Namespace;

  constructor(
    private readonly jwtService: JwtService,
    private readonly userConfig: UserConfig,
    private readonly sessionRepository: SessionRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(NotificationsGateway.name);
  }

  async handleConnection(client: Socket): Promise<void> {
    const rawToken =
      (client.handshake.auth?.token as string | undefined) ??
      client.handshake.headers?.authorization;

    const token = rawToken?.replace('Bearer ', '');

    if (!token) {
      this.logger.warn(`Connection rejected: no token, socketId=${client.id}`, 'handleConnection');
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify<{ publicId: string; deviceId: string }>(token, {
        secret: this.userConfig.accessSecret,
      });

      await this.sessionRepository.findSessionByDeviceIdAndUserId(
        payload.publicId,
        payload.deviceId,
      );

      client.data.userId = payload.publicId;
      void client.join(`user:${payload.publicId}`);
      this.logger.log(
        `User connected: userId=${payload.publicId}, socketId=${client.id}`,
        'handleConnection',
      );
    } catch {
      this.logger.warn(
        `Connection rejected: invalid token or session, socketId=${client.id}`,
        'handleConnection',
      );
      client.disconnect();
    }
  }

  emitNotification(userId: string, notification: NotificationViewDto): void {
    this.logger.log(
      `Emit notification: userId=${userId}, type=${notification.type}`,
      'emitNotification',
    );
    this.server.to(`user:${userId}`).emit(WS_EVENTS.NOTIFICATION, notification);
  }

  disconnectUser(userId: string): void {
    this.logger.log(`Force disconnect: userId=${userId}`, 'disconnectUser');
    this.server.to(`user:${userId}`).disconnectSockets(true);
  }
}
