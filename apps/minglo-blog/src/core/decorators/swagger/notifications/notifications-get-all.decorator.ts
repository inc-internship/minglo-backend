import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { NotificationsWithCursorViewDto } from '../../../../modules/notifications/api/view-dto/notifications-with-cursor.view-dto';

export function ApiNotificationsGetAllDecorator() {
  return applyDecorators(
    ApiOperation({ summary: 'Get notifications with cursor pagination (20 per page)' }),
    ApiBearerAuth('access-token'),
    ApiOkResponse({ type: NotificationsWithCursorViewDto }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
