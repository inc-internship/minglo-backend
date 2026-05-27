import { Injectable } from '@nestjs/common';
import { LoggerService } from '@app/logger';
import { Cron } from '@nestjs/schedule';
import { PostsRepository } from '../../infrastructure/posts.repository';

@Injectable()
export class PostsCleanupJob {
  constructor(
    private readonly repo: PostsRepository,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Permanently removes posts records. Runs every day at 04:00 UTC
   */
  @Cron('0 4 * * *')
  private async handleCron(): Promise<void> {
    this.logger.log('Job started', PostsCleanupJob.name);

    const ids = await this.repo.findAllDeleted();

    if (ids.length === 0) {
      this.logger.log(`Job finished, no deleted posts found`, PostsCleanupJob.name);
      return;
    }

    await this.repo.deleteManyByIds(ids);

    this.logger.log(`Job finished, deleted posts amount: ${ids.length}`, PostsCleanupJob.name);
  }
}
