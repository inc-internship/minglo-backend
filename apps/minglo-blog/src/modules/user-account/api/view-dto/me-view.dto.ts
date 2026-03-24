import { User } from '../../../../../prisma/generated/prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class MeViewDto {
  @ApiProperty({
    example: 'cmmtt3b760001g0tyyf4yfhlu',
  })
  publicId: string;

  @ApiProperty({
    example: 'avocado',
  })
  login: string;

  @ApiProperty({
    example: 'avocado@mail.com',
  })
  email: string;

  static mapToView(user: User): MeViewDto {
    const dto: MeViewDto = new MeViewDto();

    dto.publicId = user.publicId;
    dto.email = user.email;
    dto.login = user.login;

    return dto;
  }
}
