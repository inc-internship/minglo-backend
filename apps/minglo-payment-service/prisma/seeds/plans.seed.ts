import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { envFilePaths } from '../../../../libs/dynamic-config/src/env-file-paths';
import { PrismaClient } from '../generated/prisma/client';

config({ path: envFilePaths });

const adapter = new PrismaPg({ connectionString: process.env.PAYMENTS_DB_URL as string });
const prisma = new PrismaClient({ adapter });

type Plan = {
  name: string;
  durationDays: number;
  price: number;
  currency: string;
  stripePriceId: string;
};

const PLANS: Plan[] = [
  {
    name: '1 Day',
    durationDays: 1,
    price: 10.0,
    currency: 'USD',
    stripePriceId: 'price_1TSgaCAfntsZlyCsBI0Ggf3J',
  },
  {
    name: '1 Week',
    durationDays: 7,
    price: 50.0,
    currency: 'USD',
    stripePriceId: 'price_1TSgaDAfntsZlyCsdd5aywQd',
  },
  {
    name: '1 Month',
    durationDays: 30,
    price: 100.0,
    currency: 'USD',
    stripePriceId: 'price_1TSgaDAfntsZlyCsELE4stSk',
  },
];

async function seedPlans() {
  for (const plan of PLANS) {
    const existing = await prisma.plan.findFirst({
      where: { name: plan.name },
    });

    if (existing) {
      await prisma.plan.update({
        where: { id: existing.id },
        data: {
          durationDays: plan.durationDays,
          price: plan.price,
          currency: plan.currency,
          stripePriceId: plan.stripePriceId,
        },
      });
    } else {
      await prisma.plan.create({
        data: plan,
      });
    }

    console.log(`Seeded: ${plan.name}`);
  }
}

seedPlans()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
