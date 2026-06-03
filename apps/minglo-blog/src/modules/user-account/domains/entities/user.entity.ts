import { EmailConfirmationEntity } from './email-confirmation.entity';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { PasswordRecoveryEntity } from './password-recovery.entity';
import { SessionEntity } from './session.entity';

export class UserEntity {
  public id: number;
  public publicId: string;
  public emailConfirmed: boolean = false;
  public emailConfirmation: EmailConfirmationEntity;
  public passwordRecoveries: PasswordRecoveryEntity;
  public session: SessionEntity;

  constructor(
    public login: string,
    public email: string,
    public passwordHash: string | null,
  ) {}

  static create(args: { login: string; email: string; passwordHash: string | null }): UserEntity {
    const user = new UserEntity(args.login, args.email, args.passwordHash);
    user.emailConfirmation = EmailConfirmationEntity.create();
    return user;
  }

  /* Восстановление доменной сущности из БД */
  static reconstitute(args: {
    id: number;
    publicId: string;
    login: string;
    email: string;
    passwordHash: string | null;
    emailConfirmed: boolean;
    emailConfirmation: EmailConfirmationEntity;
  }): UserEntity {
    const user = new this(args.login, args.email, args.passwordHash);
    user.id = args.id;
    user.publicId = args.publicId;
    user.emailConfirmed = args.emailConfirmed;
    user.emailConfirmation = args.emailConfirmation;

    return user;
  }

  static reconstituteWithPasswordRecovery(args: {
    id: number;
    publicId: string;
    login: string;
    email: string;
    passwordHash: string | null;
    emailConfirmed: boolean;
    passwordRecoveries: PasswordRecoveryEntity;
  }): UserEntity {
    const user = new this(args.login, args.email, args.passwordHash);
    user.id = args.id;
    user.passwordRecoveries = args.passwordRecoveries;
    return user;
  }

  static reconstituteWithSession(args: {
    id: number;
    publicId: string;
    login: string;
    email: string;
    passwordHash: string | null;
    emailConfirmed: boolean;
    session: SessionEntity;
  }): UserEntity {
    const user = new this(args.login, args.email, args.passwordHash);
    user.id = args.id;
    user.session = args.session;
    user.publicId = args.publicId;
    user.session = args.session;
    user.emailConfirmed = args.emailConfirmed;
    return user;
  }

  /* Подтверждает пользователя в доменной сущности */
  confirm() {
    if (this.emailConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.ValidationError,
        message: 'Invalid code',
      });
    }
    this.emailConfirmed = true;
    this.emailConfirmation.confirm();
  }

  generatePasswordRecovery(): PasswordRecoveryEntity {
    return PasswordRecoveryEntity.create(this.id);
  }

  updatePassword(newPasswordHash: string): void {
    this.passwordHash = newPasswordHash;
  }
}
