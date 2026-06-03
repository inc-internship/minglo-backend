import { Injectable } from '@nestjs/common';
import { SessionRepository } from '../../infrastructure/session.repository';
import { LoggerService } from '@app/logger';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SessionCleanupJob {
  constructor(
    private readonly sessionRepo: SessionRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(SessionCleanupJob.name);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  private async handleCron(): Promise<void> {
    this.logger.log('Job started');

    const ids = await this.sessionRepo.findInactiveSessionIds();

    if (ids.length === 0) {
      this.logger.log(`No inactive sessions found`);
      return;
    }
    await this.sessionRepo.deleteManySessionsByIds(ids);

    this.logger.log(`Job finished, deleted sessions amount: ${ids.length}`);
  }
}
