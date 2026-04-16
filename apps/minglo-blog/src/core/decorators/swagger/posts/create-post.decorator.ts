import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseBody } from '@app/exceptions';
import { CreatePostInputDto } from '../../../../modules/posts/api/input-dto';
import { CreatePostViewDto } from '../../../../modules/posts/api/view-dto';

export function ApiCreatePostDecorator() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Create new post',
      description:
        'Creates a post using uploadIds previously obtained from /media/upload-image. Media files are not uploaded here.',
    }),
    ApiBody({
      type: CreatePostInputDto,
    }),
    ApiBadRequestResponse({
      type: ErrorResponseBody,
    }),
    ApiCreatedResponse({
      type: CreatePostViewDto,
      description: 'Success',
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}
