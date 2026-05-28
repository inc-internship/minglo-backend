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
      description: 'Success',
    }),

    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),

    ApiForbiddenResponse({
      description: 'Forbidden',
    }),

    ApiNotFoundResponse({
      description: 'Not found',
    }),
  );
}
