import { ApiProperty } from '@nestjs/swagger';

export class PostMediaFileViewDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  url: string;
  @ApiProperty()
  width: number;
  @ApiProperty()
  height: number;
  @ApiProperty()
  fileSize: number;
}
