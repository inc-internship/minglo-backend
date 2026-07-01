import { Injectable } from '@nestjs/common';
import { PrismaService } from 'apps/minglo-blog/src/database/prisma.service';
import { User } from 'apps/minglo-blog/prisma/generated/prisma/client';

@Injectable()
export class AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  /* Находит пользователя по publicId */
  async findUserByPublicId(publicId: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { publicId, deletedAt: null },
    });
  }

  /* Блокирует пользователя */
  async blockUser(publicId: string): Promise<void> {
    await this.prisma.user.update({ where: { publicId }, data: { blockedAt: new Date() } });
  }

  /* Разблокирует пользователя */
  async unblockUser(publicId: string): Promise<void> {
    await this.prisma.user.update({ where: { publicId }, data: { blockedAt: null } });
  }
}
