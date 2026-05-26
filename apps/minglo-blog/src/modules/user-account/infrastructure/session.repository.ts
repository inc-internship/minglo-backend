import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { SessionEntity } from '../domains/entities/session.entity';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { BatchPayload } from '../../../../prisma/generated/prisma/internal/prismaNamespace';
import { SessionFactory } from '../domains/factories/session.factory';
import { UserEntity } from '../domains';

@Injectable()
export class SessionRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessionFactory: SessionFactory,
  ) {}

  /* сохраняем инстанс сессии в бд */
  async save(session: SessionEntity): Promise<void> {
    await this.prisma.session.create({
      data: {
        userId: session.userId,
        deviceId: session.deviceId,
        deviceName: session.deviceName,
        browserName: session.browserName,
        browserVersion: session.browserVersion,
        osName: session.osName,
        ip: session.ip,
        issuedAt: session.issuedAt,
        expiresAt: session.expiresAt,
        lastActive: session.lastActive,
      },
    });
  }

  /* ищем сессию по publicId deviceId */
  async findSessionByDeviceIdAndUserId(publicId: string, deviceId: string): Promise<SessionEntity> {
    const record = await this.prisma.session.findFirst({
      where: {
        deviceId: deviceId,
        user: {
          publicId,
          deletedAt: null,
        },
        deletedAt: null,
      },
    });
    if (!record) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Session not found',
      });
    }
    return SessionEntity.reconstitute(record);
  }

  /* ищем сессию чисто по deviceId */
  async findSessionByDeviceId(deviceId: string): Promise<UserEntity | null> {
    const record = await this.prisma.session.findFirst({
      where: {
        deviceId: deviceId,
        deletedAt: null,
      },
      include: {
        user: true,
      },
    });

    if (!record) return null;

    return this.sessionFactory.fromSessionRecord(record);
  }

  /* обновляем активность юзера */
  async updateLastActive(session: SessionEntity): Promise<void> {
    await this.prisma.session.update({
      where: { deviceId: session.deviceId },
      data: {
        lastActive: session.lastActive,
      },
    });
  }

  /* обновляем данные рефреш токена в бд */
  async updateSessionTokens(session: SessionEntity): Promise<void> {
    await this.prisma.session.update({
      where: {
        deviceId: session.deviceId,
      },
      data: {
        issuedAt: session.issuedAt,
        expiresAt: session.expiresAt,
        lastActive: session.lastActive,
      },
    });
  }

  /* удаляем конкретныую сессию юзера */
  async deleteDeviceById(publicId: string, deviceId: string): Promise<number> {
    const result = await this.prisma.session.updateMany({
      where: {
        deviceId: deviceId,
        deletedAt: null,
        user: {
          publicId: publicId,
          deletedAt: null,
        },
      },
      data: {
        deletedAt: new Date(),
      },
    });
    return result.count;
  }

  /* Возвращает массив id записей смены паролей с протухшим проверочным кодом */
  async findAllExpired(): Promise<number[]> {
    const expiredUsers = await this.prisma.passwordRecovery.findMany({
      where: {
        OR: [{ expiresAt: { lt: new Date() } }, { usedAt: { not: null } }],
      },
      select: { id: true },
    });

    return expiredUsers.map((u) => u.id);
  }

  /* Удаляет использованные или протухшие коды из БД */
  async deleteManyByIds(ids: number[]): Promise<BatchPayload> {
    return this.prisma.passwordRecovery.deleteMany({
      where: {
        id: { in: ids },
      },
    });
  }

  /* Возвращает массив id записей сессий в которых не заходили неделю+ */
  async findInactiveSessionIds(): Promise<number[]> {
    const now = new Date();
    const result = await this.prisma.session.findMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
      select: { id: true },
    });

    return result.map((u) => u.id);
  }

  /* Удаляет не активные сессии из БД */
  async deleteManySessionsByIds(ids: number[]): Promise<BatchPayload> {
    return this.prisma.session.deleteMany({
      where: {
        id: { in: ids },
      },
    });
  }

  /* Удаляем все сессии юзера кроме текущей */
  async deleteAllOtherSessionUser(publicId: string, currentDeviceId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: {
        user: {
          publicId: publicId,
          deletedAt: null,
        },
        deletedAt: null,
        deviceId: {
          not: currentDeviceId,
        },
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
