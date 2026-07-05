import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreateConversationInputDto } from '../../../../modules/messenger/api/input-dto/create-conversation.input-dto';

export function ApiGetOrCreateConversationDecorator() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Get or create a DM conversation',
      description:
        'Returns the existing direct conversation with the target user, or creates a new one. Idempotent.',
    }),
    ApiBody({ type: CreateConversationInputDto }),
    ApiCreatedResponse({
      description: 'Conversation public id',
      schema: { properties: { conversationPublicId: { type: 'string' } } },
    }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiForbiddenResponse({ description: 'Cannot create a conversation with yourself' }),
  );
}