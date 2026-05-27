import { applyDecorators } from '@nestjs/common';
import { ApiFoundResponse, ApiOperation } from '@nestjs/swagger';

export function ApiOAuthGithub() {
  return applyDecorators(
    ApiOperation({
      summary: 'GitHub OAuth 2.0 login',
      description: 'Redirects user to GitHub authorization page',
    }),
    ApiFoundResponse({
      description: 'Redirect to GitHub authorization page.',
    }),
  );
}
