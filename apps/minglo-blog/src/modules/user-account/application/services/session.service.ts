import { Injectable } from '@nestjs/common';
import { SessionRepository } from '../../infrastructure/session.repository';
import { SessionEntity } from '../../domains/entities/session.entity';

@Injectable()
export class SessionService {
  constructor(private readonly sessionRepositories: SessionRepository) {}
  async findSessionByDeviceIdAndUserId(publicId: string, deviceId: string): Promise<SessionEntity> {
    return await this.sessionRepositories.findSessionByDeviceIdAndUserId(publicId, deviceId);
  }
}
