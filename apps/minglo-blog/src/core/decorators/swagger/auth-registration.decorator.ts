import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiNoContentResponse,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { CreateUserInputDto } from '../../../modules/user-account/api/input-dto';
import { ErrorResponseBody } from '@app/exceptions';

export function ApiAuthRegistration() {
  return applyDecorators(
    ApiBody({
      type: CreateUserInputDto,
      description: 'Register user in system',
    }),
    ApiNoContentResponse({
      description:
        'User successfully registered. Email has been sent to the specified email address',
    }),
    ApiBadRequestResponse({
      description: 'Bad request',
      type: ErrorResponseBody,
    }),
    ApiConflictResponse({
      description: 'login or email already exists',
    }),
    ApiTooManyRequestsResponse({
      description: 'More than 5 attempts from one IP-address during 10 seconds',
    }),
  );
}
