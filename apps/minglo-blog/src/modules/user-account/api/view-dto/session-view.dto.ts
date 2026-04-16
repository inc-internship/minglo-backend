import { Session } from '../../../../../prisma/generated/prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class SessionViewDto {
  @ApiProperty({
    example: '192.168.1.15',
    description: 'IP address of the device',
  })
  ip: string;

  @ApiProperty({
    example: '2026-04-04T15:44:11.000Z',
    description: 'Last activity date in ISO 8601 format',
  })
  lastActive: string;

  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Unique device identifier (UUID)',
  })
  deviceId: string;

  @ApiProperty({
    example: 'My PC',
    description: 'Device name',
  })
  deviceName: string;

  @ApiProperty({
    example: 'Chrome',
    description: 'Name of the browser',
  })
  browserName: string;

  @ApiProperty({
    example: '122.0.0.0',
    description: 'Full version of the browser',
  })
  browserVersion: string;

  @ApiProperty({
    example: 'Windows 11',
    description: 'Operating system name',
  })
  osName: string;

  @ApiProperty({
    example: 'true/false',
    description: 'current device',
  })
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
      // Сравниваем ID из базы с ID из текущего запроса/токена
      const isCurrent = session.deviceId === currentDeviceId;
      return this.mapToView(session, isCurrent);
    });
  }
}
