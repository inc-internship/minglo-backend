import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PostLikesWithCursorViewDto } from '../../../../modules/likes/api/view-dto';
import { ErrorResponseBody } from '@app/exceptions';

export function ApiLikePostDecorator() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Like a post' }),
    ApiCreatedResponse({ description: 'Post liked' }),
    ApiConflictResponse({ type: ErrorResponseBody, description: 'Already liked' }),
    ApiNotFoundResponse({ type: ErrorResponseBody, description: 'Post not found' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiTooManyRequestsResponse({ description: 'Too many requests' }),
  );
}

export function ApiUnlikePostDecorator() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Unlike a post' }),
    ApiNoContentResponse({ description: 'Like removed' }),
    ApiNotFoundResponse({ type: ErrorResponseBody, description: 'Like not found' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiTooManyRequestsResponse({ description: 'Too many requests' }),
  );
}

export function ApiLikeCommentDecorator() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Like a comment' }),
    ApiCreatedResponse({ description: 'Comment liked' }),
    ApiConflictResponse({ type: ErrorResponseBody, description: 'Already liked' }),
    ApiNotFoundResponse({ type: ErrorResponseBody, description: 'Comment not found' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiTooManyRequestsResponse({ description: 'Too many requests' }),
  );
}

export function ApiUnlikeCommentDecorator() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Unlike a comment' }),
    ApiNoContentResponse({ description: 'Like removed' }),
    ApiNotFoundResponse({ type: ErrorResponseBody, description: 'Like not found' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiTooManyRequestsResponse({ description: 'Too many requests' }),
  );
}

export function ApiGetPostLikesDecorator() {
  return applyDecorators(
    ApiOperation({ summary: 'Get users who liked a post' }),
    ApiOkResponse({ type: PostLikesWithCursorViewDto }),
    ApiNotFoundResponse({ type: ErrorResponseBody, description: 'Post not found' }),
    ApiTooManyRequestsResponse({ description: 'Too many requests' }),
  );
}
