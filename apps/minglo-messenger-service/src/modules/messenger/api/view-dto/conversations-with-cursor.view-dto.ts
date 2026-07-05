import { ApiProperty } from '@nestjs/swagger';
import { ConversationViewDto } from './conversation.view-dto';

export class ConversationsWithCursorViewDto {
  @ApiProperty({ type: [ConversationViewDto] })
  items: ConversationViewDto[];

  @ApiProperty({ type: String, nullable: true })
  nextCursor: string | null;
}
