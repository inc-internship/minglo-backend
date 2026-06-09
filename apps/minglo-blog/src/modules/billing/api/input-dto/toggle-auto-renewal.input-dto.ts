import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ToggleAutoRenewalInputDto {
  @ApiProperty({ type: Boolean, example: false })
  @IsBoolean()
  autoRenewal: boolean;
}
