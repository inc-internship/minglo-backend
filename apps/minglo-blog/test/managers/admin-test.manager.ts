import { INestApplication } from '@nestjs/common';
import request from 'supertest';

type GqlOptions = {
  auth?: boolean;
  wrongAuth?: boolean;
};

export class AdminTestManager {
  constructor(
    private readonly app: INestApplication,
    private readonly email: string,
    private readonly password: string,
    private readonly graphqlPath: string,
  ) {}

  private basicAuth(wrong = false): string {
    const email = wrong ? 'wrong@email.com' : this.email;
    const password = wrong ? 'wrong-password' : this.password;
    return `Basic ${Buffer.from(`${email}:${password}`).toString('base64')}`;
  }

  gql(query: string, variables?: Record<string, unknown>, options: GqlOptions = {}) {
    const req = request(this.app.getHttpServer()).post(this.graphqlPath);

    if (options.auth !== false) {
      req.set('Authorization', this.basicAuth(options.wrongAuth));
    }

    return req.send({ query, variables });
  }

  users(
    variables: {
      page?: number;
      pageSize?: number;
      search?: string;
      sortBy?: 'USERNAME_ASC' | 'USERNAME_DESC' | 'DATE_ASC' | 'DATE_DESC';
    } = {},
    options: GqlOptions = {},
  ) {
    return this.gql(
      `
        query Users($query: UsersQueryInput!) {
          users(query: $query) {
            items { id username profileLink dateAdded isBlocked }
            totalCount
            pagesCount
            page
          }
        }
      `,
      {
        query: {
          page: 1,
          pageSize: 8,
          sortBy: 'DATE_DESC',
          ...variables,
        },
      },
      options,
    );
  }

  user(publicId: string) {
    return this.gql(
      `
        query User($publicId: String!) {
          user(publicId: $publicId) {
            id
            username
            profileLink
            dateCreated
            isBlocked
            avatarUrl
            firstName
            lastName
            followersCount
            followingCount
          }
        }
      `,
      { publicId },
    );
  }

  userPayments(publicId: string, pagination: { page?: number; pageSize?: number } = {}) {
    return this.gql(
      `
        query UserPayments($publicId: String!, $pagination: PaginationInput!) {
          userPayments(publicId: $publicId, pagination: $pagination) {
            items {
              id
              paymentDate
              subscriptionExpiresAt
              amount
              planName
              paymentSystem
              status
              failureReason
            }
            totalCount
            pagesCount
            page
          }
        }
      `,
      {
        publicId,
        pagination: { page: 1, pageSize: 8, ...pagination },
      },
    );
  }

  userFollowers(publicId: string, pagination: { page?: number; pageSize?: number } = {}) {
    return this.gql(
      `
        query UserFollowers($publicId: String!, $pagination: PaginationInput!) {
          userFollowers(publicId: $publicId, pagination: $pagination) {
            items { userId username avatarUrl }
            totalCount
            pagesCount
            page
          }
        }
      `,
      {
        publicId,
        pagination: { page: 1, pageSize: 8, ...pagination },
      },
    );
  }

  userFollowing(publicId: string, pagination: { page?: number; pageSize?: number } = {}) {
    return this.gql(
      `
        query UserFollowing($publicId: String!, $pagination: PaginationInput!) {
          userFollowing(publicId: $publicId, pagination: $pagination) {
            items { userId username avatarUrl }
            totalCount
            pagesCount
            page
          }
        }
      `,
      {
        publicId,
        pagination: { page: 1, pageSize: 8, ...pagination },
      },
    );
  }

  deleteUser(publicId: string) {
    return this.gql(
      `
        mutation DeleteUser($publicId: String!) {
          deleteUser(publicId: $publicId)
        }
      `,
      { publicId },
    );
  }

  blockUser(publicId: string) {
    return this.gql(
      `
        mutation BlockUser($publicId: String!) {
          blockUser(publicId: $publicId)
        }
      `,
      { publicId },
    );
  }

  unblockUser(publicId: string) {
    return this.gql(
      `
        mutation UnblockUser($publicId: String!) {
          unblockUser(publicId: $publicId)
        }
      `,
      { publicId },
    );
  }
}
