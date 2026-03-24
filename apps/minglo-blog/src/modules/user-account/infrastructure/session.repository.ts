import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { SessionEntity } from '../domains/entities/session.entity';
import { DomainException, DomainExceptionCode } from '@app/exceptions';

@Injectable()
export class SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

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
        code: DomainExceptionCode.NotFound,
        message: 'Session not found',
      });
    }
    return SessionEntity.reconstitute(record);
  }

  async updateLastActive(session: SessionEntity): Promise<void> {
    await this.prisma.session.update({
      where: { deviceId: session.deviceId },
      data: {
        lastActive: session.lastActive,
      },
    });
  }
}
