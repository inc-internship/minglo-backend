import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTooManyRequestsResponse } from '@nestjs/swagger';
import { GetSubscriptionPlansViewDto } from '@app/payments/view-dto';

export function ApiGetSubscriptionPlans() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get available subscription plans',
      description: 'Redirects user to GitHub authorization page',
    }),
    ApiOkResponse({
      type: GetSubscriptionPlansViewDto,
      description: 'Success',
    }),
    ApiTooManyRequestsResponse({
      description: 'Too many attempts from the same IP address. Please try again later.',
    }),
  );
}
