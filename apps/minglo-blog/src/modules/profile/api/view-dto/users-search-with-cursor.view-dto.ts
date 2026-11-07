import { ApiProperty } from '@nestjs/swagger';
import { UserSearchItemViewDto } from './user-search-item.view-dto';

export class UsersSearchWithCursorViewDto {
  @ApiProperty({ type: () => [UserSearchItemViewDto] })
  items: UserSearchItemViewDto[];

  @ApiProperty({ type: String, nullable: true })
  nextCursor: string | null;

  @ApiProperty()
  hasNextPage: boolean;
}