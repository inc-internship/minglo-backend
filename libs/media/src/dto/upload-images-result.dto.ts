import { ApiProperty } from '@nestjs/swagger';

export class UploadImageResultDto {
  @ApiProperty()
  ids: string[];
  @ApiProperty()
  failedCount: number;
}
