import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../prisma/generated/prisma/client';

@Injectable()
export class PrismaMessengerService extends PrismaClient {
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.MESSENGER_DB_URL as string,
    });
    super({ adapter });
  }
}
