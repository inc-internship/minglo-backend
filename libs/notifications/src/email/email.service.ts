import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { emailTemplates } from '@app/notifications/email/templates';

type ConfirmationEmail = {
  email: string;
  redirectUrl: string;
  code: string;
};

@Injectable()
export class EmailService {
  constructor(private mailer: MailerService) {}

  async sendConfirmationEmail({ email, redirectUrl, code }: ConfirmationEmail): Promise<void> {
    try {
      await this.mailer.sendMail({
        to: email,
        subject: 'Complete Registration',
        html: emailTemplates.confirmationEmail(redirectUrl, code),
      });
    } catch (error) {
      console.error('Failed to send confirmation email');
      throw error;
    }
  }
}
