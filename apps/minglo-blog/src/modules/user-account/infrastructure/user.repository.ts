import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { User } from '../../../../prisma/generated/prisma/client';
import { UserEntity as UserEntity } from '../domains';
import { PrismaExceptionMapper } from '@app/exceptions';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Находит первое совпадение по login или email */
  async findFirst(login: string, email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ login }, { email }],
      },
    });
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
}
