import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AdminConfig } from '../admin.config';

@Injectable()
export class AdminBasicAuthGuard implements CanActivate {
  constructor(private readonly adminConfig: AdminConfig) {}

  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    const authHeader: string | undefined = request.headers['authorization'];

    if (!authHeader?.startsWith('Basic ')) {
      throw new UnauthorizedException('Basic auth required');
    }

    const base64 = authHeader.slice(6);
    const decoded = Buffer.from(base64, 'base64').toString('utf-8');
    const [email, password] = decoded.split(':');

    if (email !== this.adminConfig.email || password !== this.adminConfig.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return true;
  }
}
