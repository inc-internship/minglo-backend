import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNoContentResponse,
  ApiOperation,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { ErrorResponseBody } from '@app/exceptions';
import { RegistrationConfirmationResendInputDto } from '../../../modules/user-account/api/input-dto';

export function ApiAuthRegistrationConfirmationResend() {
  return applyDecorators(
    ApiOperation({
      summary: 'Resend registration confirmation email',
      description: 'Resends the email confirmation code to complete user registration.',
    }),
    ApiBody({
      type: RegistrationConfirmationResendInputDto,
      description: 'User email address to resend the confirmation code.',
    }),
    ApiNoContentResponse({
      description: 'Confirmation email has been successfully resent.',
    }),
    ApiBadRequestResponse({
      description: 'Email address is invalid or cannot be used for confirmation.',
      type: ErrorResponseBody,
    }),
    ApiTooManyRequestsResponse({
      description: 'Too many attempts from the same IP address. Please try again later.',
    }),
  );
}
