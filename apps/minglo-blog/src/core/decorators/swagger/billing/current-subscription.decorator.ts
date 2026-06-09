import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentSubscriptionInfoViewDto } from '@app/payments/view-dto';

export function ApiGetCurrentSubscription() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get current subscription info',
      description:
        'Returns account type, active subscription expiry, next payment date, and the full subscription stack.',
    }),
    ApiBearerAuth('access-token'),
    ApiOkResponse({ type: CurrentSubscriptionInfoViewDto }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiTooManyRequestsResponse({ description: 'Too many requests' }),
  );
}
