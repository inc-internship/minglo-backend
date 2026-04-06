import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SessionViewDto } from '../../../modules/user-account/api/view-dto/session-view.dto';

export function ApiSessionGetDevicesDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Returns all devices with active sessions for current user',
    }),
    ApiBearerAuth('access-token'),
    ApiOkResponse({
      description: 'Success',
      type: SessionViewDto,
      isArray: true,
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized (Access token is invalid or expired)',
    }),
  );
}
