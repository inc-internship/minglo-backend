import { randomUUID } from 'node:crypto';
import { add } from 'date-fns';
import { DomainException, DomainExceptionCode } from '@app/exceptions';

export class EmailConfirmationEntity {
  public id: number;
  public code: string;
  public expiresAt: Date;
  public confirmedAt: Date | null;

  static create(): EmailConfirmationEntity {
    const ec = new this();
    ec.code = randomUUID();
    ec.expiresAt = add(new Date(), { minutes: 10 });
    return ec;
  }

  /* Восстанавливает доменную сущность из БД */
  static reconstitute(data: {
    id: number;
    code: string;
    expiresAt: Date;
    confirmedAt: Date | null;
  }): EmailConfirmationEntity {
    const ec = new this();
    ec.id = data.id;
    ec.code = data.code;
    ec.expiresAt = data.expiresAt;
    ec.confirmedAt = data.confirmedAt;
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

  /* Устанавливает дату подтверждения кода */
  confirm() {
    this.confirmedAt = new Date();
  }

  /** Генерирует новый код и продлевает срок жизни */
  regenerate(hours = 1): void {
    this.code = randomUUID();
    this.expiresAt = add(new Date(), { hours });
  }
}
