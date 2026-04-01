import { randomUUID } from 'node:crypto';
import { add } from 'date-fns';
import { DomainException, DomainExceptionCode } from '@app/exceptions';

export class PasswordRecoveryEntity {
  public id: number;
  public recoveryCode: string;
  public expiresAt: Date;
  public usedAt: Date | null;

  constructor(public userId: number) {}

  static create(userId: number): PasswordRecoveryEntity {
    const ec: PasswordRecoveryEntity = new this(userId);
    ec.userId = userId;
    ec.recoveryCode = randomUUID();
    ec.expiresAt = add(new Date(), { hours: 1 });
    return ec;
  }

  //todo: удалить если не используется
  /* Восстанавливает доменную сущность из БД */
  static reconstitute(data: {
    id: number;
    code: string;
    userId: number;
    expiresAt: Date;
    confirmedAt: Date | null;
  }): PasswordRecoveryEntity {
    const ec: PasswordRecoveryEntity = new this(data.userId);
    ec.id = data.id;
    ec.userId = data.userId;
    ec.recoveryCode = data.code;
    ec.expiresAt = data.expiresAt;
    ec.usedAt = data.confirmedAt;
    return ec;
  }

  //todo: удалить если не используется
  /* Валидирует срок действия кода */
  validate(): void {
    if (this.expiresAt < new Date()) {
      throw new DomainException({
        code: DomainExceptionCode.ValidationError,
        message: 'Expired code',
        extensions: [{ field: 'code', message: 'Confirmation code expired' }],
      });
    }
  }

  //todo: удалить если не используется
  /* Устанавливает дату подтверждения кода */
  confirm(): void {
    this.usedAt = new Date();
  }
}
