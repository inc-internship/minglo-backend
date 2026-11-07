import { Module } from '@nestjs/common';
import { MessengerConsumerController } from './api/messenger-consumer.controller';
import { NewMessageNotificationUseCase } from './application/usecases/new-message-notification.usecase';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [MessengerConsumerController],
  providers: [NewMessageNotificationUseCase],
})
export class MessengerConsumerModule {}