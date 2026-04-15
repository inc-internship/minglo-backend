import { PrismaMediaService } from '../../../../database';
import { Injectable } from '@nestjs/common';
import { MediaFileMetaDataViewDto } from '../../api/view-dto';

@Injectable()
export class MediaQueryRepository {
  constructor(private readonly prisma: PrismaMediaService) {}

  /**
   * Finds media files by their public IDs and owner user ID.
   * Returns only active (non-deleted) files and maps them to view DTO.
   */
  async findByPublicIdsAndUserId(
    uploadIds: string[],
    publicUserId: string,
  ): Promise<MediaFileMetaDataViewDto[]> {
    const mediaFiles = await this.prisma.mediaFile.findMany({
      where: {
        publicId: { in: uploadIds },
        publicUserId,
        deletedAt: null,
      },
    });

    return mediaFiles.map((file) => MediaFileMetaDataViewDto.mapToViewDto(file));
  }
}
