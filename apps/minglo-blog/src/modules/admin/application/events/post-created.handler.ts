import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { PostCreatedEvent } from '../../../posts/application/events/post-created.event';
import { AdminQueryRepository } from '../../infrastructure/admin.query-repository';
import { PUB_SUB } from '../../../../core/pubsub.module';
import { AdminPostType } from '../../api/view-dto';
import { POST_ADDED_EVENT } from '../../constants';

@EventsHandler(PostCreatedEvent)
export class PostCreatedForAdminHandler implements IEventHandler<PostCreatedEvent> {
  constructor(
    private readonly adminQueryRepo: AdminQueryRepository,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  async handle(event: PostCreatedEvent): Promise<void> {
    const post = await this.adminQueryRepo.findPostByPublicId(event.postPublicId);
    if (post) {
      await this.pubSub.publish(POST_ADDED_EVENT, { postAdded: AdminPostType.mapToView(post) });
    }
  }
}
