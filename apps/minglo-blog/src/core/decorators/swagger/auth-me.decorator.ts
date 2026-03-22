import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function ApiAuthMeDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Me user',
      description: 'We give user data',
    }),
    ApiOkResponse({
      description: 'Successfully me',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
          email: { type: 'string', example: 'someEmail.com' },
          login: { type: 'string', example: 'someLogin' },
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Invalid token or user not found',
    }),
  );
}
