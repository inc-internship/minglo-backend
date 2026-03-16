import { randomUUID } from 'node:crypto';
import { add } from 'date-fns';
import { DomainException, DomainExceptionCode } from '@app/exceptions';

export class EmailConfirmationEntity {
  public id: number;
  public code: string;
  public expiresAt: Date;

  static create(): EmailConfirmationEntity {
    const ec = new this();
    ec.code = randomUUID();
    ec.expiresAt = add(new Date(), { hours: 1 });
    return ec;
  }

  /* Восстанавливает доменную сущность из БД */
  static reconstitute(data: {
    id: number;
    code: string;
    expiresAt: Date;
  }): EmailConfirmationEntity {
    const ec = new this();
    ec.id = data.id;
    ec.code = data.code;
    ec.expiresAt = data.expiresAt;
    return ec;
  }

  /* Валидирует срок действия кода */
  validate() {
    if (this.expiresAt < new Date()) {
      throw new DomainException({
        code: DomainExceptionCode.ValidationError,
        message: 'Expired code',
        extensions: [{ field: 'code', message: 'Confirmation code expired' }],
      });
    }
  }
}
