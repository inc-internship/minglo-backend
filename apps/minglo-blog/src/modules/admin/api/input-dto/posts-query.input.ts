import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

@InputType()
export class PostsQueryInput {
  @IsInt()
  @Min(1)
  @Max(50)
  @Field(() => Int, { defaultValue: 8 })
  pageSize: number;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  cursor?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  search?: string;
}
