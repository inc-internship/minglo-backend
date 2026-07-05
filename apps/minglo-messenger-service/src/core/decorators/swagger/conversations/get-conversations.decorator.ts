import { applyDecorators } from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ConversationsWithCursorViewDto } from '../../../../modules/messenger/api/view-dto/conversations-with-cursor.view-dto';

export function ApiGetConversationsDecorator() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Get list of conversations',
      description:
        'Returns cursor-paginated list of conversations for the current user, ordered by last activity.',
    }),
    ApiQuery({
      name: 'cursor',
      required: false,
      type: String,
      description: 'Pagination cursor (conversation publicId)',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Page size (default: 20)',
    }),
    ApiOkResponse({ type: ConversationsWithCursorViewDto, description: 'Success' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
