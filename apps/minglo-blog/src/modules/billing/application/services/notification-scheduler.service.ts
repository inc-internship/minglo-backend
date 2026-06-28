import { Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { LoggerService } from '@app/logger';
import { ExpiringSubscriptionDto, PAYMENT_SERVICE, PAYMENTS_TCP_PATTERNS } from '@app/payments';
import { NotificationService } from '../../../notifications/application/services/notification.service';
import { NotificationType } from '../../../../shared/enums';

@Injectable()
export class NotificationSchedulerService {
  constructor(
    @Inject(PAYMENT_SERVICE)
    private readonly paymentClient: ClientProxy,
    private readonly notificationService: NotificationService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(NotificationSchedulerService.name);
  }

  @Cron('0 10 * * *')
  async checkExpiringSubscriptions(): Promise<void> {
    this.logger.log('checkExpiringSubscriptions START');

    const [expiring7, expiring1] = await Promise.all([
      firstValueFrom(
        this.paymentClient.send<ExpiringSubscriptionDto[]>(
          PAYMENTS_TCP_PATTERNS.GET_EXPIRING_SUBSCRIPTIONS,
          { days: 7 },
        ),
      ),
      firstValueFrom(
        this.paymentClient.send<ExpiringSubscriptionDto[]>(
          PAYMENTS_TCP_PATTERNS.GET_EXPIRING_SUBSCRIPTIONS,
          { days: 1 },
        ),
      ),
    ]);

    this.logger.log(
      `Fetched expiring subscriptions: 7d=${expiring7.length} 1d=${expiring1.length}`,
    );

    for (const sub of expiring7) {
      await this.notificationService.createAndEmitOnce(
        sub.userId,
        NotificationType.SUBSCRIPTION_EXPIRING_7_DAYS,
        'Your subscription expires in 7 days',
      );
    }

    for (const sub of expiring1) {
      await this.notificationService.createAndEmitOnce(
        sub.userId,
        NotificationType.SUBSCRIPTION_EXPIRING_1_DAY,
        'Your subscription expires tomorrow',
      );

      if (sub.autoRenewal) {
        await this.notificationService.createAndEmitOnce(
          sub.userId,
          NotificationType.PAYMENT_REMINDER,
          'Payment will be charged tomorrow',
        );
      }
    }

    this.logger.log('checkExpiringSubscriptions DONE');
  }
}
