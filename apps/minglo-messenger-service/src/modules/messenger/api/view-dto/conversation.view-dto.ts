import { ApiProperty } from '@nestjs/swagger';
import { ConversationType } from '@app/messenger';
import { MessageViewDto, ParticipantViewDto } from './message.view-dto';

export class ConversationViewDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ enum: ConversationType, type: () => ConversationType })
  type: ConversationType;

  @ApiProperty({ type: [ParticipantViewDto] })
  participants: ParticipantViewDto[];

  @ApiProperty({ type: MessageViewDto, nullable: true })
  lastMessage: MessageViewDto | null;

  @ApiProperty()
  unreadCount: number;

  @ApiProperty()
  updatedAt: string;
}
