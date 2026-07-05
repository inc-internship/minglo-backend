import { registerEnumType } from '@nestjs/graphql';
export enum AdminBanReason {
  BAD_BEHAVIOR = 'BAD_BEHAVIOR',
  ADVERTISING_PLACEMENT = 'ADVERTISING_PLACEMENT',
  ANOTHER_REASON = 'ANOTHER_REASON',
}
registerEnumType(AdminBanReason, { name: 'AdminBanReason' });
