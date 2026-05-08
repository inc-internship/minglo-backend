import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiFoundResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiOAuthGithubCallback() {
  return applyDecorators(
    ApiOperation({
      summary: 'GitHub OAuth 2.0 callback',
      description: 'Используется для завершения авторизации пользователя.',
    }),
    ApiFoundResponse({
      description: 'Редирект на frontend после успешной авторизации.',
    }),
    ApiBadRequestResponse({
      description: 'GitHub email недоступен или не предоставлен пользователем',
    }),
    ApiUnauthorizedResponse({
      description: 'Ошибка OAuth или отказ пользователя',
    }),
  );
}
