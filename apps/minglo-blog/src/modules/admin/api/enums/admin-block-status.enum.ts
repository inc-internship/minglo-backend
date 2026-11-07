import { registerEnumType } from '@nestjs/graphql';

export enum AdminBlockStatus {
  BLOCKED = 'BLOCKED',
  NOT_BLOCKED = 'NOT_BLOCKED',
}

registerEnumType(AdminBlockStatus, { name: 'AdminBlockStatus' });
