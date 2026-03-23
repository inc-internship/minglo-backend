import { User } from '../../../../../prisma/generated/prisma/client';

export class MeViewDto {
  publicId: string;
  login: string;
  email: string;

  static mapToView(user: User): MeViewDto {
    const dto: MeViewDto = new MeViewDto();

    dto.publicId = user.publicId;
    dto.email = user.email;
    dto.login = user.login;

    return dto;
  }
}
