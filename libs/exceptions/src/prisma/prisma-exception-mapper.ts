import { DomainException } from '@app/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@app/exceptions/domain-exception-codes.enum';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

/**
 * Преобразует ошибки Prisma в доменные исключения.
 * @see https://www.prisma.io/docs/orm/prisma-client/debugging-and-troubleshooting/handling-exceptions-and-errors
 */
export class PrismaExceptionMapper {
  static map(error: unknown): never {
    if (error instanceof PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          PrismaExceptionMapper.handleUniqueConstraint(error);
          break;
      }
    }

    throw error;
  }

  private static handleUniqueConstraint(error: PrismaClientKnownRequestError): never {
    const field = (error.meta?.target as string[])?.[0];

    throw new DomainException({
      code: DomainExceptionCode.Conflict,
      message: `This ${field} is already taken.`,
      extensions: [
        {
          field,
          message: `${field} is already in use.`,
        },
      ],
    });
  }
}
