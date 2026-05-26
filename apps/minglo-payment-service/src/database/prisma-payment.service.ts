import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'apps/minglo-payment-service/prisma/generated/prisma/client';

@Injectable()
export class PrismaPaymentService extends PrismaClient {
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.PAYMENTS_DB_URL as string,
    });
    super({ adapter });
  }
}
