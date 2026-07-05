import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponseBody } from '../error-response-body.type';
import { DomainExceptionCode } from '../domain-exception-codes.enum';
import { UNKNOWN_EXCEPTION_TEXT } from '@app/exceptions/constants';
import { LoggerService } from '@app/logger';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { GqlContextType } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private logger: LoggerService) {
    this.logger.setContext(AllExceptionsFilter.name);
  }

  catch(exception: any, host: ArgumentsHost): any {
    this.logger.error(exception, `catch`);

    const message = exception.message || UNKNOWN_EXCEPTION_TEXT;

    if (host.getType<GqlContextType>() === 'graphql') {
      const gqlHost = GqlArgumentsHost.create(host);
      const info = gqlHost.getInfo();
      return new GraphQLError(message, {
        extensions: { ...this.buildResponseBody(info?.fieldName ?? 'graphql', message) },
      });
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

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
