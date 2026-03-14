import { randomUUID } from 'node:crypto';
import { add } from 'date-fns';

export class EmailConfirmation {
  public code: string;
  public expiresAt: Date;

  static create(): EmailConfirmation {
    const ec = new EmailConfirmation();
    ec.code = randomUUID();
    ec.expiresAt = add(new Date(), { hours: 1 });
    return ec;
  }
}
