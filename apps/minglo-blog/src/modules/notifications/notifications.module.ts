import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { NotificationsGateway } from './api/notifications.gateway';
import { UserLoggedOutEventHandler } from '../user-account/application/events/user-logged-out.event';
import { UserAccountModule } from '../user-account/user-account.module';

//todo: [WS] add NotificationsController, NotificationService, NotificationRepository (PJM-177)
@Module({
  imports: [JwtModule.register({}), UserAccountModule],
  controllers: [],
  providers: [NotificationsGateway, UserLoggedOutEventHandler],
  exports: [],
})
export class NotificationsModule {}
