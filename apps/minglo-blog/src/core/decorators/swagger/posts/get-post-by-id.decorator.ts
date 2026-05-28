import { applyDecorators } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ErrorResponseBody } from '@app/exceptions';
import { PostViewDto } from '../../../../modules/posts/api/view-dto';

export function ApiGetPostByIdDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get post by postId',
      description: "Returns a post by it's id",
    }),
    ApiParam({ type: String, name: 'postId' }),
    ApiNotFoundResponse({
      type: ErrorResponseBody,
      description: 'Not found',
    }),
    ApiOkResponse({
      type: PostViewDto,
      description: 'Success',
    }),
  );
}
