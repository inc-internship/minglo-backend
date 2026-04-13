import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { PasswordRecoveryInputDto } from '../../../../modules/user-account/api/input-dto';

export function ApiAuthPasswordRecoveryDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Password recovery',
      description: "Sends a password recovery link to the user's email if the account exists.",
    }),
    ApiBody({
      type: PasswordRecoveryInputDto,
      description: 'User email and redirect URL for password reset',
    }),
    ApiNoContentResponse({
      description: 'If the email exists, a recovery link has been sent.',
    }),
    ApiNotFoundResponse({
      description: 'If the email not-exists',
    }),
    ApiTooManyRequestsResponse({
      description: 'Too many attempts from the same IP address. Please try again later.',
    }),
  );
}
