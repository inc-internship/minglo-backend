import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseBody } from '@app/exceptions';
import { SendMessageInputDto } from '../../../../modules/messenger/api/input-dto/send-message.input-dto';

export function ApiSendMessageDecorator() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Send a message (HTTP fallback)',
      description: 'Sends a text message to a conversation. Prefer WebSocket (MESSAGE_SEND event) for real-time delivery.',
    }),
    ApiParam({ name: 'conversationId', type: String }),
    ApiBody({ type: SendMessageInputDto }),
    ApiCreatedResponse({ description: 'Message sent' }),
    ApiBadRequestResponse({ type: ErrorResponseBody, description: 'Validation error or empty text' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiForbiddenResponse({ description: 'Not a participant of this conversation' }),
  );
}