import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseBody } from '@app/exceptions';

export function ApiDeletePostDecorator() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Delete post',
      description: 'Soft deletes a post of the authenticated user',
    }),
    ApiParam({
      type: String,
      name: 'postId',
    }),
    ApiNotFoundResponse({
      type: ErrorResponseBody,
      description: 'Not found',
    }),
    ApiNoContentResponse({
      description: 'Post successfully deleted',
    }),
    ApiBadRequestResponse({
      type: ErrorResponseBody,
      description: 'Validation error',
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
    ApiForbiddenResponse({
      description: 'Forbidden',
    }),
    ApiTooManyRequestsResponse({
      description: 'Too many attempts from the same IP address. Please try again later.',
    }),
  );
}
