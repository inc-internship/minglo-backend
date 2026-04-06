import { Injectable } from '@nestjs/common';
import { LoggerService } from '@app/logger';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SessionRepository } from '../../infrastructure/session.repository';

@Injectable()
export class PasswordRecoveryCodeCleanupJob {
  constructor(
    private readonly sessionRepo: SessionRepository,
    private readonly logger: LoggerService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  private async handleCron(): Promise<void> {
    this.logger.log('Job started', PasswordRecoveryCodeCleanupJob.name);

    const ids = await this.sessionRepo.findAllExpired();

    if (ids.length === 0) {
      this.logger.log(`Job finished, no expired or usedAt PasswordRecovery`);
    }
    await this.sessionRepo.deleteManyByIds(ids);

    this.logger.log(
      `Job finished, deleted PasswordRecovery amount: ${ids.length}`,
      PasswordRecoveryCodeCleanupJob.name,
    );
  }
}
