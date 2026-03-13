import { Extension } from './domain-exceptions';
import { DomainExceptionCode } from './domain-exception-codes.enum';
import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseBody {
  @ApiProperty()
  timestamp: string;

  @ApiProperty()
  path: string;

  @ApiProperty({ enum: DomainExceptionCode })
  code: DomainExceptionCode;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: [Extension] })
  extensions: Extension[];
}
