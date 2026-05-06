import { UserMetadata } from '../../../../core/decorators/auth/user-agent.decorator';

export interface RequestWithUserMetaData extends Request {
  userMeta: UserMetadata;
}
