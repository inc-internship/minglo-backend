import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FeedPostsWithCursorViewDto } from '../../../../modules/posts/api/view-dto';

export function ApiGetFeedDecorator() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Get feed posts from followed users' }),
    ApiOkResponse({ type: FeedPostsWithCursorViewDto }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiTooManyRequestsResponse({ description: 'Too many requests' }),
  );
}