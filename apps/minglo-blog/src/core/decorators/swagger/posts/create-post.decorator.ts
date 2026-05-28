import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseBody } from '@app/exceptions';
import { CreatePostInputDto } from '../../../../modules/posts/api/input-dto';
import { CreatedPostViewDto } from '../../../../modules/posts/api/view-dto';

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
      description: 'Validation error',
    }),
    ApiCreatedResponse({
      type: CreatedPostViewDto,
      description: 'Success',
      example: {
        id: 'created_post_id',
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
    ApiTooManyRequestsResponse({
      description: 'Too many attempts from the same IP address. Please try again later.',
    }),
  );
}
