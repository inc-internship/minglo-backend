import { applyDecorators } from '@nestjs/common';
import { ApiFoundResponse, ApiOperation } from '@nestjs/swagger';

export function ApiOAuthGoogle() {
  return applyDecorators(
    ApiOperation({
      summary: 'Google OAuth 2.0 login',
      description: 'Redirects user to Google authorization page',
    }),
    ApiFoundResponse({
      description: 'Redirect to Google authorization page',
    }),
  );
}
