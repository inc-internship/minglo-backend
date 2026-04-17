import { Injectable } from '@nestjs/common';
import { PrismaMediaService } from '../../../database';
import { MediaFileEntity } from '../domains/entities';
import { PrismaExceptionMapper } from '@app/exceptions';
import { MediaFileFactory } from '../domains/factory/media-file.factory';
import { BatchPayload } from '../../../../prisma/generated/prisma/internal/prismaNamespace';
import { MediaMimeType } from '../../../../prisma/generated/prisma/enums';

@Injectable()
export class MediaRepository {
  constructor(
    private readonly prisma: PrismaMediaService,
    private readonly factory: MediaFileFactory,
  ) {}

  /* Save several media files to DB returns created publicIds in Array */
  async createMany(mediaFiles: MediaFileEntity[]): Promise<string[]> {
    const data = mediaFiles.map((f) => ({
      publicUserId: f.publicUserId,
      type: f.type,
      mimeType: f.mimeType as unknown as MediaMimeType,
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

  /**
   * Soft-deletes multiple media files by their keys.
   * Sets `deletedAt` timestamp for records that are not already deleted.
   */
  async softDeleteMany(keys: string[], deletedAt: Date): Promise<number> {
    try {
      const result = await this.prisma.mediaFile.updateMany({
        where: {
          key: { in: keys },
          deletedAt: null,
        },
        data: {
          deletedAt,
        },
      });

      return result.count;
    } catch (error) {
      PrismaExceptionMapper.map(error);
    }
  }

  /**
   * Finds media files that are soft-deleted but not yet removed from S3.
   * @param limit - Maximum number of records to return
   * @returns Array of media file entities pending S3 deletion
   */
  async findDeletedNotSynced(limit: number): Promise<MediaFileEntity[]> {
    try {
      const result = await this.prisma.mediaFile.findMany({
        where: {
          deletedAt: { not: null },
          s3DeletedAt: null,
        },
        take: limit,
        orderBy: { id: 'asc' },
      });
      return result.map((file) => this.factory.mapFromModel(file));
    } catch (error) {
      PrismaExceptionMapper.map(error);
    }
  }

  /**
   * Marks media files as deleted in S3 by setting `s3DeletedAt` timestamp.
   *
   * @param ids - Array of media file IDs
   * @param s3DeletedAt - Timestamp when files were deleted from S3
   * @returns Number of updated records
   */
  async markS3Deleted(ids: number[], s3DeletedAt: Date): Promise<number> {
    try {
      const result = await this.prisma.mediaFile.updateMany({
        where: { id: { in: ids } },
        data: { s3DeletedAt },
      });

      return result.count;
    } catch (error) {
      PrismaExceptionMapper.map(error);
    }
  }

  /**
   * Finds media files that have already been deleted from S3.
   *
   * @param limit - Maximum number of records to return
   * @returns Array of media file records with `s3DeletedAt` set
   */
  async findS3Deleted(limit: number) {
    try {
      return this.prisma.mediaFile.findMany({
        where: {
          s3DeletedAt: { not: null },
        },
        take: limit,
        orderBy: { id: 'asc' },
      });
    } catch (error) {
      PrismaExceptionMapper.map(error);
    }
  }

  /**
   * Permanently deletes multiple media files by their IDs.
   *
   * @param ids - Array of media file IDs to delete
   * @returns Prisma BatchPayload containing number of deleted records
   */
  async deleteByIdMany(ids: number[]): Promise<BatchPayload> {
    try {
      return this.prisma.mediaFile.deleteMany({
        where: {
          id: { in: ids },
        },
      });
    } catch (error) {
      PrismaExceptionMapper.map(error);
    }
  }
}
