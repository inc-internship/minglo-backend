import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiNotificationsMarkOneReadDecorator() {
  return applyDecorators(
    ApiOperation({ summary: 'Mark a single notification as read by id' }),
    ApiBearerAuth('access-token'),
    ApiOkResponse({ description: 'Success' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiNotFoundResponse({ description: 'Not found' }),
  );
}
