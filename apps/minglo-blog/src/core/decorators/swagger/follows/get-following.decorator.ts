import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseBody } from '@app/exceptions';
import { FollowsWithCursorViewDto } from '../../../../modules/follows/api/view-dto';

export function ApiGetFollowingDecorator() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Get users followed by a user' }),
    ApiOkResponse({ type: FollowsWithCursorViewDto }),
    ApiNotFoundResponse({ type: ErrorResponseBody, description: 'User not found' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiTooManyRequestsResponse({ description: 'Too many requests' }),
  );
}
