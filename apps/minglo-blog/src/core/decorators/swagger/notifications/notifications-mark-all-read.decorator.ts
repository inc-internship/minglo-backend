import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiNotificationsMarkAllReadDecorator() {
  return applyDecorators(
    ApiOperation({ summary: 'Mark all notifications as read' }),
    ApiBearerAuth('access-token'),
    ApiOkResponse({ description: 'Success' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
