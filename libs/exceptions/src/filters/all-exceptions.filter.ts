import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponseBody } from '../error-response-body.type';
import { DomainExceptionCode } from '../domain-exception-codes.enum';
import { UNKNOWN_EXCEPTION_TEXT } from '@app/exceptions/constants';
import { LoggerService } from '@app/logger';

@Catch()
export class AllHttpExceptionsFilter implements ExceptionFilter {
  constructor(private logger: LoggerService) {
    this.logger.setContext(AllHttpExceptionsFilter.name);
  }

  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    this.logger.error(exception, `catch`);

    const message = exception.message || UNKNOWN_EXCEPTION_TEXT;
    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const responseBody = this.buildResponseBody(request.url, message);

    response.status(status).json(responseBody);
  }

  private buildResponseBody(requestUrl: string, message: string): ErrorResponseBody {
    return {
      timestamp: new Date().toISOString(),
      path: requestUrl,
      message,
      extensions: [],
      code: DomainExceptionCode.InternalServerError,
    };
  }
}
