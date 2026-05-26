import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { User } from '../../../../prisma/generated/prisma/client';
import { UserEntity as UserEntity, UserFactory } from '../domains';
import { DomainException, DomainExceptionCode, PrismaExceptionMapper } from '@app/exceptions';
import { PasswordRecoveryEntity } from '../domains/entities/password-recovery.entity';
import { BatchPayload } from '../../../../prisma/generated/prisma/internal/prismaNamespace';

@Injectable()
export class UserRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userFactory: UserFactory,
  ) {}

  /** Находит первое совпадение по login или email */
  async findFirst(login: string, email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ login }, { email }],
        deletedAt: null,
      },
    });
  }

  /* Находит юзера по коду подтверждения email */
  async findByConfirmationCode(code: string): Promise<UserEntity> {
    const dbEmailConfirmation = await this.prisma.emailConfirmation.findFirst({
      where: {
        code,
        deletedAt: null,
        confirmedAt: null,
      },
      include: {
        user: true,
      },
    });

    if (!dbEmailConfirmation) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Invalid Code',
        extensions: [{ field: 'code', message: 'Invalid confirmation code' }],
      });
    }

    return this.userFactory.fromEmailConfirmationRecord(dbEmailConfirmation);
  }

  /* Находит юзера по email. Вернет exception (400) если пользователь не существует. */
  async findByEmailOrFail(email: string): Promise<UserEntity> {
    const dbUser = await this.prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
      include: {
        emailConfirmations: {
          where: {
            deletedAt: null,
            confirmedAt: null,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!dbUser) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Invalid email',
        extensions: [{ field: 'email', message: 'Invalid email' }],
      });
    }

    return this.userFactory.fromUserWithEmailConfirmations(dbUser);
  }

  /* Находит юзера по email, без exception */
  async findByEmail(email: string): Promise<UserEntity | null> {
    const dbUser = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
      include: {
        emailConfirmations: {
          where: { deletedAt: null, confirmedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!dbUser) {
      return null;
    }

    return this.userFactory.fromUserWithEmailConfirmations(dbUser);
  }

  /* Возвращает массив id пользователей с протухшим проверочным кодом */
  async findAllExpired(): Promise<number[]> {
    const expiredUsers = await this.prisma.user.findMany({
      where: {
        emailConfirmed: false,
        deletedAt: null,
        emailConfirmations: {
          some: {
            expiresAt: { lt: new Date() },
            confirmedAt: null,
            deletedAt: null,
          },
        },
      },
      select: { id: true },
    });

    return expiredUsers.map((u) => u.id);
  }

  /* Создает юзера */
  async create(user: UserEntity): Promise<string> {
    try {
      return this.prisma.$transaction(async (tx) => {
        const created = await tx.user.create({
          data: {
            login: user.login,
            email: user.email,
            passwordHash: user.passwordHash,
            emailConfirmed: user.emailConfirmed,
          },
        });

        await tx.emailConfirmation.create({
          data: {
            userId: created.id,
            code: user.emailConfirmation.code,
            expiresAt: user.emailConfirmation.expiresAt,
          },
        });

        return created.publicId;
      });
    } catch (error) {
      // Если login/email не уникальны, тогда
      // перехватываем ошибку базы данных и мапим ее в DomainException
      PrismaExceptionMapper.map(error);
    }
  }

  /* Подтверждает юзера */
  async confirmEmail(user: UserEntity): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { emailConfirmed: true },
      });
      await tx.emailConfirmation.update({
        where: { id: user.emailConfirmation.id },
        data: { confirmedAt: new Date() },
      });
    });
  }

  /* Сохраняет данные восстановления пароля */
  async savePasswordRecovery(recoveryData: PasswordRecoveryEntity): Promise<void> {
    await this.prisma.passwordRecovery.create({
      data: {
        userId: recoveryData.userId,
        recoveryCode: recoveryData.recoveryCode,
        expiresAt: recoveryData.expiresAt,
      },
    });
  }

  /* Удаляет пользователей из БД */
  async deleteManyByIds(ids: number[]): Promise<BatchPayload> {
    return this.prisma.user.deleteMany({
      where: {
        id: { in: ids },
      },
    });
  }

  /* Находит юзера по коду смены пароля */
  async findByRecoveryCode(recoveryCode: string): Promise<UserEntity> {
    const user = await this.prisma.passwordRecovery.findFirst({
      where: {
        recoveryCode,
        deletedAt: null,
        usedAt: null,
      },
      include: {
        user: true,
      },
    });

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Invalid Code',
        extensions: [{ field: 'code', message: 'Invalid recovery code' }],
      });
    }

    return this.userFactory.fromPasswordRecoveryRecord(user);
  }

  /* Подтверждает смену пароля */
  async confirmPasswordRecovery(user: UserEntity): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { passwordHash: user.passwordHash },
      });
      await tx.passwordRecovery.update({
        where: { id: user.passwordRecoveries.id },
        data: { usedAt: new Date() },
      });
    });
  }
}
