import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function ApiAuthRefreshTokenDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Renew access and refresh tokens',
      description: 'Exchange valid Refresh Token (from cookies) for a new pair of tokens',
    }),
    ApiOkResponse({
      description: 'Tokens successfully rotated. New Refresh Token is sent via Set-Cookie.',
      schema: {
        type: 'object',
        properties: {
          accessToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1Ni...',
            description: 'New JWT Access Token',
          },
        },
      },
      headers: {
        'Set-Cookie': {
          description: 'Contains the new refreshToken',
          schema: { type: 'string', example: 'refreshToken=abc...; HttpOnly; Path=/;' },
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Refresh token is missing, invalid or expired',
    }),
  );
}
