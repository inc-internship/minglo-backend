import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { emailTemplates } from '@app/notifications/email/templates';
import { LoggerService } from '@app/logger';

type ConfirmationEmail = {
  email: string;
  redirectUrl: string;
  code: string;
};

@Injectable()
export class EmailService {
  constructor(
    private mailer: MailerService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(EmailService.name);
  }

  async sendConfirmationEmail({ email, redirectUrl, code }: ConfirmationEmail): Promise<void> {
    try {
      await this.mailer.sendMail({
        to: email,
        subject: '[Minglo] Complete Registration',
        html: emailTemplates.confirmationEmail(redirectUrl, code),
      });
    } catch (exception) {
      this.logger.error(exception, 'Failed to send confirmation email');
      throw exception;
    }
  }
}
