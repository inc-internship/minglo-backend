import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiMarkReadDecorator() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Mark conversation as read',
      description: 'Resets the unread message counter for the current user in this conversation.',
    }),
    ApiParam({ name: 'conversationId', type: String }),
    ApiNoContentResponse({ description: 'Marked as read' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiForbiddenResponse({ description: 'Not a participant of this conversation' }),
  );
}