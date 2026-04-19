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

export type PasswordRecoveryWithUser = Prisma.PasswordRecoveryGetPayload<{
  include: { user: true };
}>;

export type UserWithPassworRecovery = Prisma.UserGetPayload<{
  include: {
    passwordRecoveries: {
      where: { deletedAt: null; confirmedAt: null };
      orderBy: { createdAt: 'desc' };
      take: 1;
    };
  };
}>;

export type SessionWithUser = Prisma.SessionGetPayload<{
  include: { user: true };
}>;

export type UserWithSession = Prisma.UserGetPayload<{
  include: {
    sessions: {
      where: { deletedAt: null };
      orderBy: { createdAt: 'desc' };
      take: 1;
    };
  };
}>;

export type PostWithMediaFileAndUserData = Prisma.PostGetPayload<{
  include: {
    user: true;
    postsMediaFiles: true;
  };
}>;

export type PostOwner = Prisma.UserGetPayload<object>;
export type PostMediaFile = Prisma.PostMediaFileGetPayload<object>;
