import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseBody } from '@app/exceptions';
import { CommentsWithCursorViewDto } from '../../../../modules/comments/api/view-dto';

export function ApiCreateCommentDecorator() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Create a comment on a post' }),
    ApiCreatedResponse({
      description: 'Comment created',
      schema: { properties: { id: { type: 'string' } } },
    }),
    ApiNotFoundResponse({ type: ErrorResponseBody, description: 'Post not found' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiTooManyRequestsResponse({ description: 'Too many requests' }),
  );
}

export function ApiReplyToCommentDecorator() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Reply to a comment' }),
    ApiCreatedResponse({
      description: 'Reply created',
      schema: { properties: { id: { type: 'string' } } },
    }),
    ApiBadRequestResponse({ type: ErrorResponseBody, description: 'Cannot reply to a reply' }),
    ApiNotFoundResponse({ type: ErrorResponseBody, description: 'Comment not found' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiTooManyRequestsResponse({ description: 'Too many requests' }),
  );
}

export function ApiDeleteCommentDecorator() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Delete own comment (soft delete)' }),
    ApiNoContentResponse({ description: 'Comment deleted' }),
    ApiNotFoundResponse({ type: ErrorResponseBody, description: 'Comment not found' }),
    ApiForbiddenResponse({ type: ErrorResponseBody, description: 'Not your comment' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiTooManyRequestsResponse({ description: 'Too many requests' }),
  );
}

export function ApiGetPostCommentsDecorator() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Get comments for a post (own comments first)' }),
    ApiOkResponse({ type: CommentsWithCursorViewDto }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiTooManyRequestsResponse({ description: 'Too many requests' }),
  );
}

export function ApiGetCommentRepliesDecorator() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Get replies to a comment' }),
    ApiOkResponse({ type: CommentsWithCursorViewDto }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiTooManyRequestsResponse({ description: 'Too many requests' }),
  );
}
