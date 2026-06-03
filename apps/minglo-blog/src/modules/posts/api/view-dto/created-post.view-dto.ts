import { ApiProperty } from '@nestjs/swagger';

export class CreatedPostViewDto {
  @ApiProperty({ type: String })
  id: string;
}
