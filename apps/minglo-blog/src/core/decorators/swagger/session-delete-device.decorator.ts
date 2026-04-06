import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiSessionDeleteDeviceDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Terminate specific session by deviceId',
    }),

    ApiBearerAuth('access-token'),
    ApiNoContentResponse({
      description: 'The session has been successfully terminated',
    }),

    ApiUnauthorizedResponse({
      description: 'Unauthorized (Access token is invalid or expired)',
    }),

    ApiForbiddenResponse({
      description: 'Forbidden (You are trying to delete a device that does not belong to you)',
    }),

    ApiNotFoundResponse({
      description: 'Device not found',
    }),
  );
}
