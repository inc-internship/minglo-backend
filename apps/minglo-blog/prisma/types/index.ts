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
    user: {
      include: {
        profile: {
          include: {
            avatar: { where: { deletedAt: null } };
          };
        };
      };
    };
    postsMediaFiles: true;
  };
}>;

export type PostOwner = Prisma.UserGetPayload<{
  include: {
    profile: {
      include: {
        avatar: { where: { deletedAt: null } };
      };
    };
  };
}>;
export type PostMediaFile = Prisma.PostMediaFileGetPayload<object>;

export type CommentWithAuthor = Prisma.CommentGetPayload<{
  include: {
    author: {
      include: {
        profile: {
          include: {
            avatar: { where: { deletedAt: null } };
          };
        };
      };
    };
    likes: true;
  };
}>;

export type FeedPostWithData = Prisma.PostGetPayload<{
  include: {
    user: {
      include: {
        profile: {
          include: {
            avatar: { where: { deletedAt: null } };
          };
        };
      };
    };
    postsMediaFiles: { orderBy: { order: 'asc' } };
    likes: true;
  };
}>;

export type UserWithProfileForPublicView = Prisma.UserGetPayload<{
  include: {
    profile: {
      include: {
        avatar: { where: { deletedAt: null } };
      };
    };
    _count: {
      select: {
        posts: { where: { deletedAt: null } };
      };
    };
  };
}>;

export type FollowWithFollowerData = Prisma.FollowGetPayload<{
  include: {
    follower: {
      include: {
        profile: {
          include: {
            avatar: { where: { deletedAt: null } };
          };
        };
      };
    };
  };
}>;

export type FollowWithFollowingData = Prisma.FollowGetPayload<{
  include: {
    following: {
      include: {
        profile: {
          include: {
            avatar: { where: { deletedAt: null } };
          };
        };
      };
    };
  };
}>;

export type PostForUpdate = Prisma.PostGetPayload<{
  select: {
    id: true;
    userId: true;
    user: {
      select: {
        publicId: true;
      };
    };
  };
}>;

export type ProfileWithUserAndAvatar = Prisma.ProfileGetPayload<{
  include: {
    avatar: { where: { deletedAt: null } };
    user: {
      select: {
        login: true;
        accountType: true;
      };
    };
  };
}>;
