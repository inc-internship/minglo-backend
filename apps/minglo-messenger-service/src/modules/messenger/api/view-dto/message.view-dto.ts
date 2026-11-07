import { ApiProperty } from '@nestjs/swagger';
import { MessageType } from '@app/messenger';

export class ParticipantViewDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String, nullable: true })
  login: string | null;

  @ApiProperty({ type: String, nullable: true })
  avatarUrl: string | null;
}

export class MessageViewDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  conversationId: string;

  @ApiProperty({ type: String, nullable: true })
  text: string | null;

  @ApiProperty({ enum: MessageType, type: () => MessageType })
  type: MessageType;

  @ApiProperty({ type: ParticipantViewDto })
  sender: ParticipantViewDto;

  @ApiProperty({ type: String })
  createdAt: string;
}
