import { PostOwnerViewDto } from './post-owner.view-dto';
import { PostMediaFileViewDto } from './post-media-file.view-dto';
import { ApiProperty } from '@nestjs/swagger';

export class PostViewDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ nullable: true })
  description: string;

  @ApiProperty({
    type: () => [PostMediaFileViewDto],
  })
  images: PostMediaFileViewDto[];

  @ApiProperty({
    type: PostOwnerViewDto,
  })
  owner: PostOwnerViewDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
