import { Prisma } from '../generated/prisma/client';

export type EmailConfirmationWithUser = Prisma.EmailConfirmationGetPayload<{
  include: { user: true };
}>;
