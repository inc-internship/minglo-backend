import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseBody } from '@app/exceptions';
import { LoginUserInputDto } from '../../../modules/user-account/api/input-dto/login-user.input.dto';
import { AccessTokenResponse } from '../../../modules/user-account/api/types';

export function ApiAuthLoginDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Login user',
      description: 'Login user in system',
    }),
    ApiBody({
      type: LoginUserInputDto,
      description: 'Login user in system',
    }),
    ApiOkResponse({
      description: 'Successfully logged in',
      type: AccessTokenResponse,
    }),
    ApiBadRequestResponse({
      description: 'Incorrect input data',
      type: ErrorResponseBody,
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}
