import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { NotificationsGateway } from './api/notifications.gateway';

//todo: [WS] add NotificationsController, NotificationService, NotificationRepository (PJM-177)
@Module({
  imports: [JwtModule.register({})],
  controllers: [],
  providers: [NotificationsGateway],
  exports: [],
})
export class NotificationsModule {}
