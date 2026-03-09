import { Extension } from './domain-exceptions';
import { DomainExceptionCode } from './domain-exception-codes.enum';

export type ErrorResponseBody = {
  timestamp: string;
  path: string | null;
  message: string;
  extensions: Extension[];
  code: DomainExceptionCode;
};
