import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

type UpdateCodeArgs = { id: number; code: string; expiresAt: Date };

@Injectable()
export class EmailConfirmationRepository {
  constructor(private readonly prisma: PrismaService) {}

  /* Обновляет проверочный код и продлевает срок действия*/
  async updateCodeAndExp({ id, code, expiresAt }: UpdateCodeArgs): Promise<void> {
    await this.prisma.emailConfirmation.update({
      where: { id },
      data: { code, expiresAt },
    });
  }
}
