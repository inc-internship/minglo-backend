import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { MulterError } from 'multer';
import { DomainExceptionCode } from '../domain-exception-codes.enum';
import { ErrorResponseBody } from '../error-response-body.type';
import { LoggerService } from '@app/logger';

@Catch(MulterError)
export class MulterExceptionsFilter implements ExceptionFilter {
  constructor(private logger: LoggerService) {
    this.logger.setContext(MulterExceptionsFilter.name);
  }

  catch(exception: MulterError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    this.logger.warn(`Multer error: ${exception.code}`, 'catch');

    const message = this.mapToMessage(exception);
    const responseBody = this.buildResponseBody(request.url, message);

    response.status(HttpStatus.BAD_REQUEST).json(responseBody);
  }

  private mapToMessage(exception: MulterError): string {
    switch (exception.code) {
      case 'LIMIT_FILE_SIZE':
        return 'File size exceeds the allowed limit.';
      case 'LIMIT_FILE_COUNT':
        return 'Too many files uploaded at once.';
      case 'LIMIT_UNEXPECTED_FILE':
        return 'Unexpected file field.';
      default:
        return exception.message;
    }
  }

  private buildResponseBody(requestUrl: string, message: string): ErrorResponseBody {
    return {
      timestamp: new Date().toISOString(),
      path: requestUrl,
      message,
      code: DomainExceptionCode.ValidationError,
      extensions: [],
    };
  }
}
