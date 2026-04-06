import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../infrastructure';
import { LoggerService } from '@app/logger';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class UsersCleanupJob {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly logger: LoggerService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  private async handleCron(): Promise<void> {
    this.logger.log('Job started', UsersCleanupJob.name);

    const ids = await this.userRepo.findAllExpired();

    if (ids.length === 0) {
      this.logger.log(`Job finished, no expired users found`, UsersCleanupJob.name);
      return;
    }

    await this.userRepo.deleteManyByIds(ids);

    this.logger.log(`Job finished, deleted users amount: ${ids.length}`, UsersCleanupJob.name);
  }
}
