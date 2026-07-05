import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateConversationInputDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  participantPublicId: string;
}
