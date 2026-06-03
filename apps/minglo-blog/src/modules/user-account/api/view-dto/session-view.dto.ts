import { Session } from '../../../../../prisma/generated/prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class SessionViewDto {
  @ApiProperty({ type: String })
  ip: string;

  @ApiProperty({ type: String, format: 'date-time' })
  lastActive: string;

  @ApiProperty({ type: String })
  deviceId: string;

  @ApiProperty({ type: String })
  deviceName: string;

  @ApiProperty({ type: String })
  browserName: string;

  @ApiProperty({ type: String })
  browserVersion: string;

  @ApiProperty({ type: String })
  osName: string;

  @ApiProperty({ type: Boolean })
  isCurrent: boolean;

  static mapToView(session: Session, isCurrent: boolean = false): SessionViewDto {
    const dto: SessionViewDto = new SessionViewDto();

    dto.ip = session.ip;
    dto.lastActive = session.lastActive.toISOString();
    dto.deviceId = session.deviceId;
    dto.deviceName = session.deviceName;
    dto.browserName = session.browserName;
    dto.browserVersion = session.browserVersion;
    dto.osName = session.osName;
    dto.isCurrent = isCurrent;

    return dto;
  }

  static mapToManyView(sessions: Session[], currentDeviceId: string): SessionViewDto[] {
    return sessions.map((session) => {
      const isCurrent = session.deviceId === currentDeviceId;
      return this.mapToView(session, isCurrent);
    });
  }
}
