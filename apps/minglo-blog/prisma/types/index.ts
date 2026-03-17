import { Prisma } from '../generated/prisma/client';

export type EmailConfirmationWithUser = Prisma.EmailConfirmationGetPayload<{
  include: { user: true };
}>;

export type UserWithEmailConfirmation = Prisma.UserGetPayload<{
  include: {
    emailConfirmations: {
      where: { deletedAt: null; confirmedAt: null };
      orderBy: { createdAt: 'desc' };
      take: 1;
    };
  };
}>;
