import { Injectable } from '@nestjs/common';
import { SessionEntity } from '../entities/session.entity';
import { JwtPayload } from '../../application/services/token.service';
import { UserMetadata } from '../../../../core/decorators/auth/user-agent.decorator';
import { DeviceService } from '../../application/services/device.service';
import { Session } from '../../../../../prisma/generated/prisma/client';

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

  fromRecord(record: Session): SessionEntity {
    return SessionEntity.reconstitute({
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
    });
  }
}
