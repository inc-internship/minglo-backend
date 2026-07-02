import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { AdminUserSortField } from '../enums/admin-user-sort.enum';

@InputType()
export class UsersQueryInput {
  @IsInt()
  @Min(1)
  @Field(() => Int, { defaultValue: 1 })
  page: number;

  @IsInt()
  @Min(1)
  @Field(() => Int, { defaultValue: 8 })
  pageSize: number;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  search?: string;

  @IsEnum(AdminUserSortField)
  @Field(() => AdminUserSortField, { defaultValue: AdminUserSortField.DATE_DESC })
  sortBy: AdminUserSortField;
}
