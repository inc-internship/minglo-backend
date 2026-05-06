import { ApiProperty } from '@nestjs/swagger';
import { PostMediaFile } from '../../../../../prisma/types';

export class PostMediaFileViewDto {
  @ApiProperty()
  public id: string;

  @ApiProperty()
  public url: string;

  @ApiProperty()
  public width: number;

  @ApiProperty()
  public height: number;

  @ApiProperty()
  public mimeType: string;

  @ApiProperty()
  public fileSize: number;

  private constructor(mediaFile: PostMediaFile) {
    this.id = mediaFile.publicId;
    this.url = mediaFile.url;
    this.width = mediaFile.width;
    this.height = mediaFile.height;
    this.mimeType = mediaFile.mimeType.toLowerCase().split('_').join('/');
    this.fileSize = mediaFile.fileSize;
  }

  static create(mediaFile: PostMediaFile): PostMediaFileViewDto {
    return new PostMediaFileViewDto(mediaFile);
  }
}
