import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { AdminBanReason } from '../enums/admin-ban-reason.enum';

@InputType()
export class BlockUserInput {
  @IsString()
  @IsNotEmpty()
  @Field()
  publicId: string;

  @IsEnum(AdminBanReason)
  @Field(() => AdminBanReason)
  reason: AdminBanReason;

  @ValidateIf((o) => o.reason === AdminBanReason.ANOTHER_REASON)
  @IsNotEmpty({ message: 'Custom reason is required if reason is another reason' })
  @IsString()
  @Field(() => String, { nullable: true })
  customReason: string;
}
