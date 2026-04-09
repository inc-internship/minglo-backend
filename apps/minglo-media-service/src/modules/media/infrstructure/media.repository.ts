import { Injectable } from '@nestjs/common';
import { PrismaMediaService } from '../../../database';
import { MediaFileEntity } from '../domains/entities';
import { PrismaExceptionMapper } from '@app/exceptions';

@Injectable()
export class MediaRepository {
  constructor(private readonly prisma: PrismaMediaService) {}

  /* Save several media files to DB returns created publicIds in Array */
  async createMany(mediaFiles: MediaFileEntity[]): Promise<string[]> {
    const data = mediaFiles.map((f) => ({
      publicUserId: f.publicUserId,
      type: f.type,
      mimeType: f.mimeType,
      url: f.url,
      key: f.key,
      width: f.width,
      height: f.height,
      fileSize: f.fileSize,
    }));

    try {
      const tasks = data.map((d) =>
        this.prisma.mediaFile.create({
          data: d,
        }),
      );
      const result = await Promise.all(tasks);
      return result.map((r) => r.publicId);
    } catch (error) {
      // перехватываем ошибку базы данных и мапим ее в DomainException
      PrismaExceptionMapper.map(error);
    }
  }
}
