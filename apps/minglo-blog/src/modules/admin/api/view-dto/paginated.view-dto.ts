import { Type } from '@nestjs/common';
import { Field, Int, ObjectType } from '@nestjs/graphql';

export function PaginatedType<TItem>(ItemType: Type<TItem>) {
  @ObjectType({ isAbstract: true })
  abstract class PageClass {
    @Field(() => [ItemType]) items: TItem[];
    @Field(() => Int) totalCount: number;
    @Field(() => Int) pagesCount: number;
    @Field(() => Int) page: number;
  }
  return PageClass;
}
