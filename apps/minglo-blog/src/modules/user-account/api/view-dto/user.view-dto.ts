import { User } from '../../../../../prisma/generated/prisma/client';

export class UserViewDto {
  id: string;
  login: string;
  email: string;
  createdAt: Date;

  static mapToView(user: User): UserViewDto {
    const dto = new UserViewDto();

    dto.email = user.email;
    dto.login = user.login;
    dto.id = user.publicId;
    dto.createdAt = user.createdAt;

    return dto;
  }
}
