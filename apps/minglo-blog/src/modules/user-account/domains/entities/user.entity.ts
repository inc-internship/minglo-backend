import { EmailConfirmationEntity } from './email-confirmation.entity';
import { DomainException, DomainExceptionCode } from '@app/exceptions';

export class UserEntity {
  public id: number;
  public emailConfirmed: boolean = false;
  public emailConfirmation: EmailConfirmationEntity;

  constructor(
    public login: string,
    public email: string,
    public passwordHash: string,
  ) {}

  static create(args: { login: string; email: string; passwordHash: string }): UserEntity {
    const user = new UserEntity(args.login, args.email, args.passwordHash);
    user.emailConfirmation = EmailConfirmationEntity.create();
    return user;
  }

  /* Восстановление доменной сущности из БД */
  static reconstitute(args: {
    id: number;
    login: string;
    email: string;
    passwordHash: string;
    emailConfirmed: boolean;
    emailConfirmation: EmailConfirmationEntity;
  }): UserEntity {
    const user = new this(args.login, args.email, args.passwordHash);
    user.id = args.id;
    user.emailConfirmed = args.emailConfirmed;
    user.emailConfirmation = args.emailConfirmation;

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
}
