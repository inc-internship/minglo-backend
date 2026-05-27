import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiSessionTerminateAllOtherSessionsDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Terminate all other sessions',
      description: 'Deletes all active sessions for user, except for the current device session.',
    }),

    ApiBearerAuth('access-token'),
    ApiNoContentResponse({
      description: 'Success',
    }),

    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}
