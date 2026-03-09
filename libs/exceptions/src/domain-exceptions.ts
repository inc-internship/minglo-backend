import { DomainExceptionCode } from './domain-exception-codes.enum';
import { ApiProperty } from '@nestjs/swagger';

export class Extension {
  @ApiProperty()
  field: string;

  @ApiProperty()
  message: string;
}

export class DomainException extends Error {
  message: string;
  code: DomainExceptionCode;
  extensions: Extension[];

  constructor(errorInfo: { code: DomainExceptionCode; message: string; extensions?: Extension[] }) {
    super(errorInfo.message);
    this.message = errorInfo.message;
    this.code = errorInfo.code;
    this.extensions = errorInfo.extensions || [];
  }
}
