import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Testing')
@Controller('testing')
export class MingloTestController {
  constructor(private readonly prisma: PrismaService) {}

  @Delete('delete-all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAll() {
    // Получаем список всех таблиц в схеме public,
    // исключая служебные таблицы Prisma (миграции)
    const tables = await this.prisma.$queryRaw<{ tablename: string }[]>`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename NOT LIKE '_prisma%'
    `;

    for (const { tablename } of tables) {
      // RESTART IDENTITY сбрасывает счётчики serial/sequence
      // CASCADE автоматически очищает зависимые таблицы
      await this.prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" RESTART IDENTITY CASCADE`);
    }
  }
}
