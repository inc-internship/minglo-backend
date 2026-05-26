import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiDeleteMyProfileDecorator() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Delete my profile (Soft Delete)',
      description:
        'Marks the user profile as deleted. After this, the user will no longer be able to log in or be visible in searches.',
    }),
    ApiNoContentResponse({
      description: 'Profile successfully marked as deleted.',
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized - Access token is missing or invalid.',
    }),
  );
}
