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

        // 2. Проверка что все запрошенные ID существуют и принадлежат пользователю
        const foundIds = new Set(files.map((f) => f.publicId));
        const invalidIds = uploadIds.filter((id) => !foundIds.has(id));
        if (invalidIds.length > 0) {
          throw new DomainException({
            code: DomainExceptionCode.BadRequest,
            message: `Invalid or inaccessible upload IDs: ${invalidIds.join(', ')}`,
            extensions: invalidIds.map((id) => ({
              field: 'uploadIds',
              message: `ID ${id} not found`,
            })),
          });
        }

        // 3. Проверка что файлы ещё не использованы
        for (const file of files) {
          if (file.usedAt !== null) {
            throw new DomainException({
              code: DomainExceptionCode.Conflict,
              message: `File with uploadId ${file.publicId} has already been used`,
              extensions: [{ field: 'uploadIds', message: `ID ${file.publicId} is already used` }],
            });
          }
        }

        // 4. Помечаем файлы как использованные
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

        this.logger.log(`consume-media success user=${publicUserId}`);

        return files.map((file) => MediaFileMetaDataViewDto.mapToViewDto(file));
      });
    } catch (error) {
      PrismaExceptionMapper.map(error);
    }
  }
}
