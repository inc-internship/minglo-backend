import { ApiProperty } from '@nestjs/swagger';
import { MessageViewDto } from './message.view-dto';

export class MessagesWithCursorViewDto {
  @ApiProperty({ type: [MessageViewDto] })
  items: MessageViewDto[];

  @ApiProperty({ type: String, nullable: true })
  nextCursor: string | null;
}