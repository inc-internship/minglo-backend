import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { FollowsRepository } from '../../infrastructure/follows.repository';
import { UserQueryRepository } from '../../../user-account/infrastructure/queries';

export class FollowUserCommand {
  constructor(
    public readonly followerPublicId: string,
    public readonly followingPublicId: string,
  ) {}
}

@CommandHandler(FollowUserCommand)
export class FollowUserUseCase implements ICommandHandler<FollowUserCommand, void> {
  constructor(
    private readonly userQueryRepo: UserQueryRepository,
    private readonly followsRepo: FollowsRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(FollowUserUseCase.name);
  }

  async execute({ followerPublicId, followingPublicId }: FollowUserCommand): Promise<void> {
    if (followerPublicId === followingPublicId) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Cannot follow yourself',
        extensions: [{ field: 'userId', message: 'Cannot follow yourself' }],
      });
    }

    this.logger.log(`FollowUser START follower=${followerPublicId} following=${followingPublicId}`);

    const followerId = await this.userQueryRepo.findIdByPublicId(followerPublicId);
    const followingId = await this.userQueryRepo.findIdByPublicId(followingPublicId);

    await this.followsRepo.create(followerId, followingId);

    this.logger.log(
      `FollowUser SUCCESS follower=${followerPublicId} following=${followingPublicId}`,
    );
  }
}
