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

export function ApiLoginDecorator() {
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
      schema: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Incorrect input data',
      type: ErrorResponseBody,
    }),
    ApiUnauthorizedResponse({
      description: 'Invalid login or password',
      type: ErrorResponseBody,
    }),
  );
}
