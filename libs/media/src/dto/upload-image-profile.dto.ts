import { ApiProperty } from '@nestjs/swagger';

class ImageResponseDto {
  @ApiProperty({ example: 'clv123abc...', description: 'Public ID из базы' })
  id: string;

  @ApiProperty({ example: 'https://s3.cloud.com/avatars/user/photo.webp' })
  url: string;
}

export class UploadImageProfileDto {
  @ApiProperty({ type: ImageResponseDto })
  mainImage: ImageResponseDto;

  @ApiProperty({ type: ImageResponseDto })
  thumbnail: ImageResponseDto;
}
