import { ConfirmationEmail, EmailService } from '@app/notifications';

export class EmailServiceMock extends EmailService {
  sendConfirmationEmail: jest.Mock = jest.fn(async (_dto: ConfirmationEmail): Promise<void> => {});

  sendPasswordRecoveryEmail: jest.Mock = jest.fn(
    async (_dto: ConfirmationEmail): Promise<void> => {},
  );
}
