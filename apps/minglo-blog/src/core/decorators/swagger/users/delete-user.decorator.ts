import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiDeleteUserDecorator() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Delete my account',
      description: 'Deletes the current user and all associated data (profile, sessions, etc.).',
    }),
    ApiNoContentResponse({ description: 'Account successfully deleted.' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized.' }),
  );
}
