import { Injectable } from '@nestjs/common';
import { LoggerService } from '@app/logger';
import { Cron } from '@nestjs/schedule';
import { MediaRepository } from '../../infrstructure';

@Injectable()
export class MediaFilesDBCleanupJob {
  constructor(
    private readonly repo: MediaRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(MediaFilesDBCleanupJob.name);
  }

  /**
   * Permanently removes media records after S3 deletion is confirmed
   * Runs every day at 04:00 UTC
   */
  @Cron('0 4 * * *')
  async handleCron(): Promise<void> {
    this.logger.log('DB cleanup started', 'handleCron');

    const batchSize = 500;

    const files = await this.repo.findS3Deleted(batchSize);

    if (!files.length) {
      this.logger.log('DB cleanup finished (no files)', 'handleCron');
      return;
    }

    const ids = files.map((f) => f.id);

    await this.repo.deleteByIdMany(ids);

    this.logger.log(`DB cleanup finished, deleted=${ids.length}/${files.length}`, 'handleCron');
  }
}
