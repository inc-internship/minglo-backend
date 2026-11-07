import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { FollowsRepository } from '../../infrastructure/follows.repository';
import { UserQueryRepository } from '../../../user-account/infrastructure/queries';

export class UnfollowUserCommand {
  constructor(
    public readonly followerPublicId: string,
    public readonly followingPublicId: string,
  ) {}
}

@CommandHandler(UnfollowUserCommand)
export class UnfollowUserUseCase implements ICommandHandler<UnfollowUserCommand, void> {
  constructor(
    private readonly userQueryRepo: UserQueryRepository,
    private readonly followsRepo: FollowsRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(UnfollowUserUseCase.name);
  }

  async execute({ followerPublicId, followingPublicId }: UnfollowUserCommand): Promise<void> {
    this.logger.log(
      `UnfollowUser START follower=${followerPublicId} following=${followingPublicId}`,
    );

    const followerId = await this.userQueryRepo.findIdByPublicId(followerPublicId);
    const followingId = await this.userQueryRepo.findIdByPublicId(followingPublicId);

    await this.followsRepo.delete(followerId, followingId);

    this.logger.log(
      `UnfollowUser SUCCESS follower=${followerPublicId} following=${followingPublicId}`,
    );
  }
}
