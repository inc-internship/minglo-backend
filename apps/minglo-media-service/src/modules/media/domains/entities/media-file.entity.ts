import { CreateMediaFileDto } from '../dto/create-media-file.dto';
import { MediaMimeType, MediaType } from '@app/media/enums';
import { MediaFile } from '../../../../../prisma/generated/prisma/client';

/**
 * Media file entity
 * Represents a media file in the domain layer
 */
export class MediaFileEntity {
  /** DB id, undefined until saved */
  public id?: number;

  /** Public id (cuid), undefined until saved */
  public publicId?: string;

  /** User this file belongs to */
  public publicUserId: string;

  /** Type of media */
  public type: MediaType;

  /** Mime type of the file */
  public mimeType: MediaMimeType;

  /** Publicly accessible URL */
  public url: string;

  /** Internal S3 key, never exposed outside */
  public key: string;

  /** Image width (optional) */
  public width: number;

  /** Image height (optional) */
  public height: number;

  /** File size in bytes (optional) */
  public fileSize: number;

  /** Optional timestamp when file was used */
  public usedAt?: Date;

  /** Optional timestamps managed by DB */
  public createdAt?: Date;
  public updatedAt?: Date;
  public deletedAt?: Date;
  public s3DeletedAt?: Date;

  constructor(props: {
    id?: number;
    publicId?: string;
    publicUserId: string;
    type: MediaType;
    mimeType: MediaMimeType;
    url: string;
    key: string;
    width: number;
    height: number;
    fileSize: number;
    usedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
    s3DeletedAt?: Date;
  }) {
    Object.assign(this, props);
  }

  /**
   * Factory method to create entity from DTO (before saving to DB)
   */
  static create(dto: CreateMediaFileDto): MediaFileEntity {
    return new MediaFileEntity({
      publicUserId: dto.publicUserId,
      type: dto.type,
      mimeType: dto.mimeType,
      url: dto.url,
      key: dto.key,
      width: dto.width,
      height: dto.height,
      fileSize: dto.fileSize,
    });
  }

  /* Восстанавливает доменную сущность из БД */
  static reconstitute(file: MediaFile): MediaFileEntity {
    return {
      id: file.id,
      publicId: file.publicId,
      publicUserId: file.publicUserId,
      type: file.type as unknown as MediaType,
      mimeType: file.mimeType as unknown as MediaMimeType,
      url: file.url,
      key: file.key,
      width: file.width,
      height: file?.height,
      fileSize: file.fileSize,
      usedAt: file.usedAt ?? undefined,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      deletedAt: file.deletedAt ?? undefined,
      s3DeletedAt: file.s3DeletedAt ?? undefined,
    };
  }
}
