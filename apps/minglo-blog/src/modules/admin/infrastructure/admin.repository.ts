import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { User } from '../../../../prisma/generated/prisma/client';

@Injectable()
export class AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  /* Находит пользователя по publicId */
  async findUserByPublicId(publicId: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { publicId, deletedAt: null },
    });
  }

  /* Блокирует пользователя и удаляет все его сессии */
  async blockUser(publicId: string, blockReason: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { publicId },
        data: { blockedAt: new Date(), blockReason },
      }),
      this.prisma.session.deleteMany({
        where: { user: { publicId } },
      }),
    ]);
  }

  /* Разблокирует пользователя */
  async unblockUser(publicId: string): Promise<void> {
    await this.prisma.user.update({
      where: { publicId },
      data: { blockedAt: null, blockReason: null },
    });
  }
}
