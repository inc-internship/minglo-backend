import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Optional JWT guard: allows unauthenticated access.
 * - No token or invalid token → request.user = null (public access).
 * - Valid token → request.user = ActiveUserDto.
 */
@Injectable()
export class OptionalAccessGuard extends AuthGuard('jwt') {
  handleRequest(_err: any, user: any) {
    return user ?? null;
  }
}
