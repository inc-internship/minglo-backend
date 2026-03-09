import { Extension } from './domain-exceptions';
import { DomainExceptionCode } from './domain-exception-codes.enum';
import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseBody {
  @ApiProperty({ example: '2026-03-09T18:00:00Z' })
  timestamp: string;

  @ApiProperty({ example: '/users', nullable: true })
  path: string | null;

  @ApiProperty({ example: 'User not found' })
  message: string;

  @ApiProperty({ type: [Extension] })
  extensions: Extension[];

  @ApiProperty({ enum: DomainExceptionCode })
  code: DomainExceptionCode;
}
