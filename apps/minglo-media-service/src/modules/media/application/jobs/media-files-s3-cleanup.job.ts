import { Injectable } from '@nestjs/common';
import { LoggerService } from '@app/logger';
import { Cron } from '@nestjs/schedule';
import { MediaRepository } from '../../infrstructure';
import { S3StorageService } from '../../../storage/application/services';

@Injectable()
export class MediaFilesS3CleanupJob {
  constructor(
    private readonly repo: MediaRepository,
    private readonly logger: LoggerService,
    private readonly storage: S3StorageService,
  ) {
    this.logger.setContext(MediaFilesS3CleanupJob.name);
  }

  /**
   * Runs every day at 03:00 UTC
   * Deletes soft-deleted media from S3
   */
  @Cron('0 3 * * *')
  private async handleCron(): Promise<void> {
    this.logger.log('media cleanup from s3 started', 'handleCron');

    const batchSize = 500;

    const filesToBeDeleted = await this.repo.findDeletedNotSynced(batchSize);

    if (filesToBeDeleted.length === 0) {
      this.logger.log('media cleanup finished (no more files)', 'handleCron');
      return;
    }

    const keys = filesToBeDeleted.map((f) => f.key);
    const ids = filesToBeDeleted.map((f) => f.id);

    await this.storage.deleteMany(keys);

    this.logger.log('update s3DeletedAt in DB', 'handleCron');
    await this.repo.markS3Deleted(ids as number[], new Date());

    this.logger.log('media cleanup from s3 finished', 'handleCron');
  }
}
