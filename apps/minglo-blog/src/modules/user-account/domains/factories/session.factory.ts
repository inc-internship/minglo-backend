import { Injectable } from '@nestjs/common';
import { SessionEntity } from '../entities/session.entity';
import { JwtPayload } from '../../application/services/token.service';
import { UserMetadata } from '../../../../core/decorators/auth/user-agent.decorator';
import { DeviceService } from '../../application/services/device.service';
import { SessionWithUser } from '../../../../../prisma/types';
import { UserEntity } from '../entities';

@Injectable()
export class SessionFactory {
  constructor(private readonly deviceService: DeviceService) {}

  create(userId: number, deviceId: string, payload: JwtPayload, meta: UserMetadata): SessionEntity {
    const { browserName, browserVersion, osName, deviceName } = this.deviceService.parse(
      meta.userAgent,
    );

    return SessionEntity.create({
      userId,
      deviceId,
      deviceName,
      browserName,
      browserVersion,
      osName,
      ip: meta.ip,
      lastActive: new Date(),
      issuedAt: new Date(payload.iat * 1000),
      expiresAt: new Date(payload.exp * 1000),
    });
  }

  /* Перегрузка prisma модели Session в доменную сущность UserEntity */
  fromSessionRecord(record: SessionWithUser): UserEntity {
    return UserEntity.reconstituteWithSession({
      id: record.user.id,
      publicId: record.user.publicId,
      login: record.user.login,
      email: record.user.email,
      passwordHash: record.user.passwordHash,
      emailConfirmed: record.user.emailConfirmed,
      session: SessionEntity.reconstitute({
        id: record.id,
        userId: record.userId,
        deviceId: record.deviceId,
        deviceName: record.deviceName,
        browserName: record.browserName,
        browserVersion: record.browserVersion,
        osName: record.osName,
        ip: record.ip,
        lastActive: record.lastActive,
        issuedAt: record.issuedAt,
        expiresAt: record.expiresAt,
      }),
    });
  }
}
