import { EmailConfirmation } from './email-confirmation.entity';

export class UserEntity {
  public emailConfirmed: boolean = false;
  public emailConfirmation: EmailConfirmation;

  constructor(
    public login: string,
    public email: string,
    public passwordHash: string,
  ) {}

  static create(args: { login: string; email: string; passwordHash: string }): UserEntity {
    const user = new UserEntity(args.login, args.email, args.passwordHash);
    user.emailConfirmation = EmailConfirmation.create();
    return user;
  }

  confirm() {
    this.emailConfirmed = true;
  }
}
