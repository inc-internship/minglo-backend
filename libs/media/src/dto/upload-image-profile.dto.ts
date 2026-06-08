import { ApiProperty } from '@nestjs/swagger';
import { MediaMimeType } from '../enums';

class AvatarImageDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  url: string;

  @ApiProperty({ type: String })
  key: string;

  @ApiProperty({ type: Number })
  width: number;

  @ApiProperty({ type: Number })
  height: number;

  @ApiProperty({ type: Number })
  fileSize: number;

  @ApiProperty({ enum: MediaMimeType, enumName: 'MediaMimeType' })
  mimeType: MediaMimeType;
}

export class UploadImageProfileDto {
  @ApiProperty({ type: AvatarImageDto })
  original: AvatarImageDto;

  @ApiProperty({ type: AvatarImageDto })
  thumbnail: AvatarImageDto;
}
