import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, Max, Min } from 'class-validator';

@InputType()
export class PaginationInput {
  @IsInt()
  @Min(1)
  @Field(() => Int, { defaultValue: 1 })
  page: number = 1;

  @IsInt()
  @Min(1)
  @Max(50)
  @Field(() => Int, { defaultValue: 8 })
  pageSize: number = 8;
}
