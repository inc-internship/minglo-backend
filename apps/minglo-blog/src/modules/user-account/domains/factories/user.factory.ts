import { Injectable } from '@nestjs/common';
import { CryptoService } from '../../application/services';
import { EmailConfirmationEntity, UserEntity } from '../entities';
import {
  EmailConfirmationWithUser,
  PassworRecoveryWithUser,
  UserWithEmailConfirmation,
} from '../../../../../prisma/types';
import { PasswordRecoveryEntity } from '../entities/password-recovery.entity';

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
  fromEmailConfirmationRecord(record: EmailConfirmationWithUser): UserEntity {
    return UserEntity.reconstitute({
      id: record.user.id,
      publicId: record.user.publicId,
      login: record.user.login,
      email: record.user.email,
      passwordHash: record.user.passwordHash,
      emailConfirmed: record.user.emailConfirmed,
      emailConfirmation: EmailConfirmationEntity.reconstitute({
        id: record.id,
        code: record.code,
        expiresAt: record.expiresAt,
        confirmedAt: record.confirmedAt,
      }),
    });
  }

  /* Перегрузка prisma модели PasswordRecovery в доменную сущность UserEntity */
  fromPasswordRecoveryRecord(record: PassworRecoveryWithUser): UserEntity {
    return UserEntity.reconstituteWithPasswordRecovery({
      id: record.user.id,
      publicId: record.user.publicId,
      login: record.user.login,
      email: record.user.email,
      passwordHash: record.user.passwordHash,
      emailConfirmed: record.user.emailConfirmed,
      passwordRecoveries: PasswordRecoveryEntity.reconstitute({
        id: record.id,
        userId: record.userId,
        recoveryCode: record.recoveryCode,
        expiresAt: record.expiresAt,
        confirmedAt: record.usedAt,
      }),
    });
  }

  /* Перегрузка prisma модели User с массивом emailConfirmations в доменную сущность для resend */
  fromUserWithEmailConfirmations(record: UserWithEmailConfirmation): UserEntity {
    return UserEntity.reconstitute({
      id: record.id,
      publicId: record.publicId,
      login: record.login,
      email: record.email,
      passwordHash: record.passwordHash,
      emailConfirmed: record.emailConfirmed,
      emailConfirmation: EmailConfirmationEntity.reconstitute({
        ...record.emailConfirmations[0],
      }),
    });
  }
}
