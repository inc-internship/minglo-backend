import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiNotificationsDeleteOneDecorator() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a notification by id' }),
    ApiBearerAuth('access-token'),
    ApiOkResponse({ description: 'Success' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiNotFoundResponse({ description: 'Not found' }),
  );
}
