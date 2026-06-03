import { PostOwnerViewDto } from './post-owner.view-dto';
import { PostMediaFileViewDto } from './post-media-file.view-dto';
import { ApiProperty } from '@nestjs/swagger';

export class PostViewDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String, nullable: true })
  description: string | null;

  @ApiProperty({ type: () => [PostMediaFileViewDto] })
  images: PostMediaFileViewDto[];

  @ApiProperty({ type: PostOwnerViewDto })
  owner: PostOwnerViewDto;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: string;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: string;
}
