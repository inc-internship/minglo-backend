import { applyDecorators } from '@nestjs/common';
import { ApiFoundResponse, ApiOperation, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function ApiOAuthGoogleCallback() {
  return applyDecorators(
    ApiOperation({
      summary: 'Google OAuth 2.0 callback',
      description: 'Используется для завершения авторизации пользователя.',
    }),
    ApiFoundResponse({
      description: 'Редирект на frontend после успешной авторизации.',
    }),
    ApiUnauthorizedResponse({
      description: 'Ошибка OAuth или отказ пользователя',
    }),
  );
}
