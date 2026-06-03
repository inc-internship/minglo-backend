import { ApiProperty } from '@nestjs/swagger';
import { PostMediaFile } from '../../../../../prisma/types';

export class PostMediaFileViewDto {
  @ApiProperty({ type: String })
  public id: string;

  @ApiProperty({ type: String })
  public url: string;

  @ApiProperty({ type: Number })
  public width: number;

  @ApiProperty({ type: Number })
  public height: number;

  @ApiProperty({ type: String })
  public mimeType: string;

  @ApiProperty({ type: Number })
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
