import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class DeleteAvatarInputDto {
  @ApiProperty({
    example: 'clv123abc...',
    description: 'Public ID of the original or thumbnail media file',
  })
  @IsString()
  @IsNotEmpty()
  mediaId: string;
}
