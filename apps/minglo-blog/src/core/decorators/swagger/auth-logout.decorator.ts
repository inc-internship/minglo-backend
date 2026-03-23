import { applyDecorators } from '@nestjs/common';
import { ApiNoContentResponse, ApiOperation, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function ApiAuthLogoutDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Logout current session',
      description:
        'Terminates the current user session by removing it from the database and clearing the refresh token cookie.',
    }),
    ApiNoContentResponse({
      description: 'Successfully logged out. Refresh token cookie is cleared.',
      headers: {
        'Set-Cookie': {
          description: 'Clears the refreshToken by setting its expiration to the past.',
          schema: { type: 'string', example: 'refreshToken=; Max-Age=0; Path=/;' },
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Access token is missing or invalid',
    }),
  );
}
