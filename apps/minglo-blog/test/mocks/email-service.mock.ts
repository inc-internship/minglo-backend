import { ConfirmationEmail, EmailService } from '@app/notifications';

export class EmailServiceMock extends EmailService {
  sendConfirmationEmail: jest.Mock = jest.fn(async (dto: ConfirmationEmail): Promise<void> => {
    console.log('Call mock method sendConfirmationEmail / EmailServiceMock', dto);
  });

  sendPasswordRecoveryEmail: jest.Mock = jest.fn(async (dto: ConfirmationEmail): Promise<void> => {
    console.log('Call mock method sendPasswordRecoveryEmail / EmailServiceMock', dto);
  });
}
