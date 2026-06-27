import { ApiProperty } from '@nestjs/swagger';
import { NotificationViewDto } from './notification.view-dto';

export class NotificationsWithCursorViewDto {
  @ApiProperty({ type: () => [NotificationViewDto] })
  items: NotificationViewDto[];

  @ApiProperty({ type: String, nullable: true })
  nextCursor: string | null;

  @ApiProperty({ type: Boolean })
  hasNextPage: boolean;

  @ApiProperty({ type: Number })
  totalCount: number;
}
