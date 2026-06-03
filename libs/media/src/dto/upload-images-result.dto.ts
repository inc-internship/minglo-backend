import { ApiProperty } from '@nestjs/swagger';

export class UploadImageResultDto {
  @ApiProperty({ type: [String] })
  ids: string[];

  @ApiProperty({ type: Number })
  failedCount: number;
}
