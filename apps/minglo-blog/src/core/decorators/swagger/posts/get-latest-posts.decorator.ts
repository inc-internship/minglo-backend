import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { PostViewDto } from '../../../../modules/posts/api/view-dto';

export function ApiGetLatestPostsDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get latest posts',
      description: 'Returns 4 latest posts from all users',
    }),
    ApiOkResponse({
      description: 'Latest posts successfully retrieved',
      type: PostViewDto,
      isArray: true,
    }),
  );
}
