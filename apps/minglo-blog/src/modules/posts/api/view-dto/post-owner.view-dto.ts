import { ApiProperty } from '@nestjs/swagger';
import { PostOwner } from '../../../../../prisma/types';

export class PostOwnerViewDto {
  @ApiProperty()
  public id: string;
  @ApiProperty()
  public login: string;

  private constructor(owner: PostOwner) {
    this.id = owner.publicId;
    this.login = owner.login;
  }

  static create(owner: PostOwner): PostOwnerViewDto {
    return new this(owner);
  }
}
