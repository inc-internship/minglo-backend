import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { MessengerConfig } from '../../../core/messenger.config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: MessengerConfig,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Missing access token',
      });
    }

    try {
      const payload = this.jwtService.verify<{ publicId: string }>(token, {
        secret: this.config.accessSecret,
      });
      request.user = { userId: payload.publicId };
      return true;
    } catch {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid or expired access token',
      });
    }
  }

  private extractToken(request: any): string | null {
    const auth: string | undefined = request.headers?.authorization;
    if (!auth) return null;
    return auth.replace('Bearer ', '') || null;
  }
}
