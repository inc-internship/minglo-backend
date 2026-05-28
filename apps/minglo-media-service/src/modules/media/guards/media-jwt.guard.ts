import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { MediaAuthorizedServices } from '@app/media/enums';

const TRUSTED_SERVICES = new Set([MediaAuthorizedServices.MINGLO_BLOG]);

/**
 * Guard for service-to-service requests.
 * Validates the JWT signed by a trusted internal service (e.g. minglo-blog).
 * Expects a Bearer token in the Authorization header.
 */
@Injectable()
export class MediaJwtGuard extends AuthGuard('jwt') {
  handleRequest(err, user) {
    if (err || !user || !TRUSTED_SERVICES.has(user.service)) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
      });
    }
    return user;
  }
}
