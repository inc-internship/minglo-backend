import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseBody } from '@app/exceptions';

export function ApiFollowUserDecorator() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Follow a user' }),
    ApiCreatedResponse({ description: 'Successfully followed' }),
    ApiBadRequestResponse({ type: ErrorResponseBody, description: 'Cannot follow yourself' }),
    ApiNotFoundResponse({ type: ErrorResponseBody, description: 'User not found' }),
    ApiConflictResponse({ type: ErrorResponseBody, description: 'Already following this user' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiTooManyRequestsResponse({ description: 'Too many requests' }),
  );
}
