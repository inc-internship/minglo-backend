import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponseBody } from '../error-response-body.type';
import { DomainExceptionCode } from '../domain-exception-codes.enum';
import { UNKNOWN_EXCEPTION_TEXT } from '@app/exceptions/constants';
import { LoggerService } from '@app/logger';
import { MulterError } from 'multer';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private logger: LoggerService) {
    this.logger.setContext(AllExceptionsFilter.name);
  }

  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof MulterError && exception.code === 'LIMIT_FILE_SIZE') {
      this.logger.warn(`File size limit exceeded`, `catch`);
      const responseBody = this.buildResponseBody(
        request.url,
        'File size exceeds the allowed limit: 3 Mb.',
      );
      response.status(HttpStatus.BAD_REQUEST).json({
        ...responseBody,
        code: DomainExceptionCode.ValidationError,
      });
      return;
    }

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
