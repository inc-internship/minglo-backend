import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { PasswordRecoveryEntity } from '../domains/entities/password-recovery.entity';

@Injectable()
export class PasswordRecoveryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(obj: PasswordRecoveryEntity) {
    await this.prisma.passwordRecovery.create({
      data: {
        userId: obj.userId,
        recoveryCode: obj.recoveryCode,
        expiresAt: obj.expiresAt,
      },
    });
  }
}
