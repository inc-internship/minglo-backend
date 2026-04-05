import { DomainException } from '@app/exceptions';
import { PasswordRecoveryEntity } from '../../src/modules/user-account/domains/entities/password-recovery.entity';
import { sub } from 'date-fns';

describe('PasswordRecoveries Unit Tests', () => {
  it('should throw error if recovery code is expired', () => {
    const recovery = PasswordRecoveryEntity.create(123);

    recovery.expiresAt = sub(new Date(), { minutes: 11 });

    expect(() => {
      recovery.validate();
    }).toThrow(DomainException);
  });

  it('should throw error if recovery code is already used', () => {
    const recovery = PasswordRecoveryEntity.create(123);
    recovery.usedAt = new Date();

    expect(() => {
      recovery.validate();
    }).toThrow(DomainException);
  });
});
