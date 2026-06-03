import { User } from '../../../../../prisma/generated/prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class MeViewDto {
  @ApiProperty({ type: String })
  publicId: string;

  @ApiProperty({ type: String })
  login: string;

  @ApiProperty({ type: String })
  email: string;

  static mapToView(user: User): MeViewDto {
    const dto: MeViewDto = new MeViewDto();

    dto.publicId = user.publicId;
    dto.email = user.email;
    dto.login = user.login;

    return dto;
  }
}
