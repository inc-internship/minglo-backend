import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { NotificationsGateway } from './api/notifications.gateway';
import { NotificationsController } from './api/notifications.controller';
import { NotificationRepository } from './infrastructure/notification.repository';
import { UserLoggedOutEventHandler } from '../user-account/application/events/user-logged-out.event';
import { UserAccountModule } from '../user-account/user-account.module';
import { GetNotificationsHandler } from './application/queries';
import {
  DeleteNotificationUseCase,
  MarkAllNotificationsReadUseCase,
  MarkNotificationReadUseCase,
} from './application/usecases';

const usecases = [
  MarkAllNotificationsReadUseCase,
  MarkNotificationReadUseCase,
  DeleteNotificationUseCase,
];

const queries = [GetNotificationsHandler];

@Module({
  imports: [JwtModule.register({}), UserAccountModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsGateway,
    UserLoggedOutEventHandler,
    NotificationRepository,
    ...usecases,
    ...queries,
  ],
  exports: [],
})
export class NotificationsModule {}
