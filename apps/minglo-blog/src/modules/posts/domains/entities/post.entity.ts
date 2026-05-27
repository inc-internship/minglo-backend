import { PostMediaFileEntity } from './post-media-file.entity';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { PostMediaFileMetaData } from '../../mappers/media-file-metadata.mapper';

type PostEntityConstructorDto = {
  id: number | null;
  publicId: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  deletedAt: Date | null;
  description: string | null;
  userId: number;
  media: PostMediaFileEntity[];
};

type CreatePostEntityDto = {
  userId: number;
  media: PostMediaFileMetaData[];
  description?: string | null;
};

export class PostEntity {
  private id: number | null;
  private publicId: string | null;
  private createdAt: Date | null;
  private updatedAt: Date | null;
  private deletedAt: Date | null;
  private description: string | null;
  private userId: number;
  private media: PostMediaFileEntity[];

  private constructor(dto: PostEntityConstructorDto) {
    this.id = dto.id;
    this.publicId = dto.publicId;
    this.createdAt = dto.createdAt;
    this.updatedAt = dto.updatedAt;
    this.deletedAt = dto.deletedAt;
    this.description = dto.description;
    this.userId = dto.userId;
    this.media = dto.media;
  }

  static create(dto: CreatePostEntityDto): PostEntity {
    const { media, description = null, userId } = dto;

    if (description && description.length > 500) {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: 'Description too long',
      });
    }

    if (media.length < 1 || media.length > 10) {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: 'Post must have form 1 to 10 media files',
      });
    }

    const mediaEntities = media.map((mediaMeta, index) =>
      PostMediaFileEntity.create({
        url: mediaMeta.url,
        key: mediaMeta.key,
        width: mediaMeta.width,
        height: mediaMeta.height,
        fileSize: mediaMeta.fileSize,
        mimeType: mediaMeta.mimeType,
        order: index,
      }),
    );

    return new PostEntity({
      userId,
      description,
      media: mediaEntities,
      id: null,
      publicId: null,
      createdAt: null,
      updatedAt: null,
      deletedAt: null,
    });
  }

  getUserId() {
    return this.userId;
  }

  getDescription() {
    return this.description;
  }

  getMedia() {
    return this.media;
  }
}
