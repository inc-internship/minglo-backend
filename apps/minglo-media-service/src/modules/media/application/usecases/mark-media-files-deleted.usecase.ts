import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { MediaRepository } from '../../infrstructure';

export class MarkMediaFilesDeletedCommand {
  constructor(public keys: string[]) {}
}

/**
 * Use case that handles soft deletion of media files.
 * Updates `deletedAt` timestamp and logs execution result.
 */
@CommandHandler(MarkMediaFilesDeletedCommand)
export class MarkMediaFilesDeletedUseCase implements ICommandHandler<
  MarkMediaFilesDeletedCommand,
  void
> {
  constructor(
    private readonly repo: MediaRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(MarkMediaFilesDeletedCommand.name);
  }

  /**
   * Executes soft delete operation for media files.
   */
  async execute({ keys }: MarkMediaFilesDeletedCommand): Promise<void> {
    const now = new Date();

    this.logger.log(`mark deleted start count=${keys.length}`);

    const deletedCount = await this.repo.softDeleteMany(keys, now);

    this.logger.log(`mark deleted success updated=${deletedCount}/${keys.length}`);
  }
}
