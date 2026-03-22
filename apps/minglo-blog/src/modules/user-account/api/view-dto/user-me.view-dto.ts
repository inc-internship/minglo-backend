import { User } from '../../../../../prisma/generated/prisma/client';

export class UserMeViewDto {
  id: string;
  login: string;
  email: string;

  static mapToView(user: User): UserMeViewDto {
    const dto: UserMeViewDto = new UserMeViewDto();

    dto.id = user.publicId;
    dto.email = user.email;
    dto.login = user.login;

    return dto;
  }
}
