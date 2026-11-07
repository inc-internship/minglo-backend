import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseBody } from '@app/exceptions';
import { UpdatePostInputDto } from '../../../../modules/posts/api/input-dto';

export function ApiUpdatePostDecorator() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Update post',
      description: 'Updates post description for the authenticated user',
    }),
    ApiParam({
      type: String,
      name: 'postId',
    }),
    ApiBody({
      type: UpdatePostInputDto,
    }),
    ApiNotFoundResponse({
      type: ErrorResponseBody,
      description: 'Not found',
    }),
    ApiNoContentResponse({
      description: 'Post successfully updated',
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
