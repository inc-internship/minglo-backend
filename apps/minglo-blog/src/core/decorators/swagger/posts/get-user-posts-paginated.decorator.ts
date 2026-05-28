import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiTooManyRequestsResponse } from '@nestjs/swagger';
import { PostsWithCursorViewDto } from '../../../../modules/posts/api/view-dto';

export function ApiGetUserPostsPaginatedDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get user posts',
      description: 'Returns paginated list of user posts ordered from newest to oldest',
    }),
    ApiParam({
      name: 'userId',
      type: String,
    }),
    ApiOkResponse({
      description: 'Success',
      type: PostsWithCursorViewDto,
    }),
    ApiTooManyRequestsResponse({
      description: 'Too many attempts from the same IP address. Please try again later.',
    }),
  );
}
