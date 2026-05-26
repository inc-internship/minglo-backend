import { MediaMimeType } from '@app/media/enums';

type PostMediaFileEntityConstructorDto = {
  id: number | null;
  publicId: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  deletedAt: Date | null;

  postId: number | null;
  url: string;
  key: string;
  mimeType: MediaMimeType;
  width: number;
  height: number;
  fileSize: number;
  order: number;
};

type CreatePostMediaFileEntityDto = {
  url: string;
  key: string;
  mimeType: MediaMimeType;
  width: number;
  height: number;
  fileSize: number;
  order: number;
};

export class PostMediaFileEntity {
  private id: number | null;
  private publicId: string | null;
  private createdAt: Date | null;
  private updatedAt: Date | null;
  private deletedAt: Date | null;

  private postId: number | null;
  private url: string;
  private key: string;
  private mimeType: MediaMimeType;
  private width: number;
  private height: number;
  private fileSize: number;
  private order: number;

  constructor(dto: PostMediaFileEntityConstructorDto) {
    this.id = dto.id;
    this.publicId = dto.publicId;
    this.createdAt = dto.createdAt;
    this.updatedAt = dto.updatedAt;
    this.deletedAt = dto.deletedAt;
    this.postId = dto.postId;
    this.url = dto.url;
    this.key = dto.key;
    this.mimeType = dto.mimeType;
    this.width = dto.width;
    this.height = dto.height;
    this.fileSize = dto.fileSize;
    this.order = dto.order;
  }

  static create(dto: CreatePostMediaFileEntityDto): PostMediaFileEntity {
    return new this({
      id: null,
      publicId: null,
      createdAt: null,
      updatedAt: null,
      deletedAt: null,
      postId: null,
      url: dto.url,
      key: dto.key,
      mimeType: dto.mimeType,
      width: dto.width,
      height: dto.height,
      fileSize: dto.fileSize,
      order: dto.order,
    });
  }

  getUrl(): string {
    return this.url;
  }
  getKey(): string {
    return this.key;
  }
  getMimeType(): MediaMimeType {
    return this.mimeType;
  }
  getWidth(): number {
    return this.width;
  }
  getHeight(): number {
    return this.height;
  }
  getOrder(): number {
    return this.order;
  }
  getFileSize() {
    return this.fileSize;
  }
}
