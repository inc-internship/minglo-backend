import { registerEnumType } from '@nestjs/graphql';

export enum AdminUserSortField {
  USERNAME_ASC = 'USERNAME_ASC',
  USERNAME_DESC = 'USERNAME_DESC',
  DATE_ASC = 'DATE_ASC',
  DATE_DESC = 'DATE_DESC',
}

registerEnumType(AdminUserSortField, { name: 'AdminUserSortField' });
