import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { MediaQueryRepository } from '../../infrstructure/query';
import { MediaFileMetaDataViewDto } from '../../api/view-dto';

export class GetMediaFilesMetaDataQuery {
  constructor(
    public publicUserId: string,
    public uploadIds: string[],
  ) {}
}

/**
 * Returns metadata for user-owned media files by upload IDs.
 */
@QueryHandler(GetMediaFilesMetaDataQuery)
export class GetMediaFilesMetaDataQueryHandler implements IQueryHandler<
  GetMediaFilesMetaDataQuery,
  MediaFileMetaDataViewDto[]
> {
  constructor(
    private readonly queryRepo: MediaQueryRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(GetMediaFilesMetaDataQueryHandler.name);
  }
  async execute({
    publicUserId,
    uploadIds,
  }: GetMediaFilesMetaDataQuery): Promise<MediaFileMetaDataViewDto[]> {
    const result = await this.queryRepo.findByPublicIdsAndUserId(uploadIds, publicUserId);

    this.logger.log(`get-media-meta done found=${result.length}`);

    return result;
  }
}
