import { Session } from '../../../../../prisma/generated/prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class GetDevicesViewDto {
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
    description: 'Custom device name if provided',
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

  static mapToView(session: Session): GetDevicesViewDto {
    const dto: GetDevicesViewDto = new GetDevicesViewDto();

    dto.ip = session.ip;
    dto.lastActive = session.lastActive.toISOString();
    dto.deviceId = session.deviceId;
    dto.deviceName = session.deviceName;
    dto.browserName = session.browserName;
    dto.browserVersion = session.browserVersion;
    dto.osName = session.osName;

    return dto;
  }

  static mapToManyView(sessions: Session[]): GetDevicesViewDto[] {
    return sessions.map((session) => this.mapToView(session));
  }
}
