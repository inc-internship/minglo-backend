import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { PrismaMediaService } from '../../../../database';
import { DomainException, DomainExceptionCode, PrismaExceptionMapper } from '@app/exceptions';
import { MediaFileMetaDataViewDto } from '@app/media/api/view-dto';

export class ConsumeMediaFilesCommand {
  constructor(
    public publicUserId: string,
    public uploadIds: string[],
  ) {}
}

/**
 * Consumes (locks) media files and returns their metadata.
 * Ensures files are owned by user, not deleted, and not previously used.
 */
@CommandHandler(ConsumeMediaFilesCommand)
export class ConsumeMediaFilesUseCase implements ICommandHandler<
  ConsumeMediaFilesCommand,
  MediaFileMetaDataViewDto[]
> {
  constructor(
    private readonly prisma: PrismaMediaService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(ConsumeMediaFilesUseCase.name);
  }
  async execute({
    publicUserId,
    uploadIds,
  }: ConsumeMediaFilesCommand): Promise<MediaFileMetaDataViewDto[]> {
    try {
      const now = new Date();

      this.logger.log(
        `consume-media start user=${publicUserId} uploadIds count: ${uploadIds.length}`,
      );

      return this.prisma.$transaction(async (tx) => {
        // 1. Берём только валидные (ещё не использованные)
        const files = await tx.mediaFile.findMany({
          where: {
            publicId: { in: uploadIds },
            publicUserId,
            deletedAt: null,
          },
        });

        this.logger.debug(`consume-media fetched=${files.length} requested=${uploadIds.length}`);

        // 2. Проверка целостности
        for (const file of files) {
          if (file.usedAt !== null) {
            throw new DomainException({
              code: DomainExceptionCode.Conflict,
              message: `File with uploadId ${file.publicId} can't be used twice!`,
            });
          }
        }

        // 3. Помечаем файлы как использованные
        const updateResult = await tx.mediaFile.updateMany({
          where: {
            publicId: { in: uploadIds },
            publicUserId,
            usedAt: null,
          },
          data: {
            usedAt: now,
          },
        });

        this.logger.debug(
          `consume-media updated=${updateResult.count} expected=${uploadIds.length}`,
        );

        // 4. страховка от гонок
        if (updateResult.count !== uploadIds.length) {
          throw new DomainException({
            code: DomainExceptionCode.Conflict,
            message: 'Race condition detected',
          });
        }

        this.logger.log(`consume-media success user=${publicUserId}`);

        return files.map((file) => MediaFileMetaDataViewDto.mapToViewDto(file));
      });
    } catch (error) {
      PrismaExceptionMapper.map(error);
    }
  }
}
