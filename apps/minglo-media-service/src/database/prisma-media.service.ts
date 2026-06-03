import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../prisma/generated/prisma/client';

@Injectable()
export class PrismaMediaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.MEDIA_DB_URL as string,
    });
    super({ adapter });
  }
}
