import { Injectable } from '@nestjs/common';
import { CryptoService } from '../../application/services/crypto.service';
import { EmailConfirmationEntity, UserEntity } from '../entities';
import { EmailConfirmationWithUser } from '../../../../../prisma/types';

type UserCreateArgs = {
  login: string;
  email: string;
  password: string;
  forSA?: boolean;
};

@Injectable()
export class UserFactory {
  constructor(private readonly crypto: CryptoService) {}

  /* Создает доменную сущность юзера */
  async create(args: UserCreateArgs): Promise<UserEntity> {
    const { login, email, password, forSA = false } = args;

    const passwordHash = await this.crypto.hashPassword(password);

    const user = UserEntity.create({ login, email, passwordHash });

    // если юзера создает админ, тогда сразу подтверждаем
    if (forSA) {
      user.confirm();
    }

    return user;
  }

  /* Перегрузка prisma модели emailConfirmation в доменную сущность UserEntity */
  fromPersistenceWithConfirmation(record: EmailConfirmationWithUser): UserEntity {
    return UserEntity.reconstitute({
      id: record.user.id,
      login: record.user.login,
      email: record.user.email,
      passwordHash: record.user.passwordHash,
      emailConfirmed: record.user.emailConfirmed,
      emailConfirmation: EmailConfirmationEntity.reconstitute({
        id: record.id,
        code: record.code,
        expiresAt: record.expiresAt,
      }),
    });
  }
}
