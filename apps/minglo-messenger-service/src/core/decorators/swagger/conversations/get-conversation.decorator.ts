import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ConversationViewDto } from '../../../../modules/messenger/api/view-dto/conversation.view-dto';

export function ApiGetConversationDecorator() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Get conversation by id' }),
    ApiParam({ name: 'conversationId', type: String }),
    ApiOkResponse({ type: ConversationViewDto, description: 'Success' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiForbiddenResponse({ description: 'Not a participant of this conversation' }),
    ApiNotFoundResponse({ description: 'Conversation not found' }),
  );
}