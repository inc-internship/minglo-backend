import { ApiProperty } from '@nestjs/swagger';

export class ToggleAutoRenewalInputDto {
  @ApiProperty({ type: String })
  userId: string;
  @ApiProperty({ type: Boolean })
  autoRenewal: boolean;
}
