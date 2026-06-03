import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiAuthLogoutDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Logout user',
      description:
        'Terminates the current user session by removing it from the database and clearing the refresh token cookie.',
    }),
    ApiBearerAuth('access-token'),
    ApiNoContentResponse({
      description: 'Success',
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}
