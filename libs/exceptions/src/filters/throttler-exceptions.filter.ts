import { ThrottlerException } from '@nestjs/throttler';
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response, Request } from 'express';
import { LoggerService } from '@app/logger';

@Catch(ThrottlerException)
export class ThrottlerExceptionsFilter implements ExceptionFilter {
  constructor(private logger: LoggerService) {
    this.logger.setContext(ThrottlerExceptionsFilter.name);
  }

  catch(exception: ThrottlerException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    this.logger.warn(exception.message, 'catch');

    response.status(HttpStatus.TOO_MANY_REQUESTS).json({
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
    });
  }
}
