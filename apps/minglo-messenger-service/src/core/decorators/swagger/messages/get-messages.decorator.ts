import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { MessagesWithCursorViewDto } from '../../../../modules/messenger/api/view-dto/messages-with-cursor.view-dto';

export function ApiGetMessagesDecorator() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Get message history',
      description: 'Returns paginated message history for a conversation, ordered newest first.',
    }),
    ApiParam({ name: 'conversationId', type: String }),
    ApiQuery({ name: 'cursor', required: false, type: String, description: 'Pagination cursor (message publicId)' }),
    ApiQuery({ name: 'limit', required: false, type: Number, description: 'Page size (default: 20)' }),
    ApiOkResponse({ type: MessagesWithCursorViewDto, description: 'Success' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiForbiddenResponse({ description: 'Not a participant of this conversation' }),
  );
}