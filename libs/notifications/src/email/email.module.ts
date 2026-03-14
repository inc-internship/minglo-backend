import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailConfig } from '@app/notifications/email/email.config';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: EmailConfig) => {
        return {
          transport: {
            service: config.service,
            auth: {
              user: config.address,
              pass: config.password,
            },
          },
          defaults: {
            from: config.from,
          },
        };
      },
      inject: [EmailConfig],
      extraProviders: [EmailConfig],
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
