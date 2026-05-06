import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { RequestWithUserMetaData } from '../../application/interfaces';

@Injectable()
export class UserMetaMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    (req as unknown as RequestWithUserMetaData).userMeta = {
      ip:
        (req.headers['x-forwarded-for'] as string) ||
        req.ip ||
        req.socket.remoteAddress ||
        'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
    };

    next();
  }
}
