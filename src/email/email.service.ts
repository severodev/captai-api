import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { FirstAccess } from '../users/entity/first-access.entity';
import { PasswordRecovery } from '../users/entity/password-recovery.entity';

import { join } from 'path';
import { I18nContext } from 'nestjs-i18n';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
  ) {}

  async sendEmailPasswordRecoveryRequest(passwordRecovey: PasswordRecovery) {
    this.mailerService
      .sendMail({
        to: 'severo@dellead.com',
        from: await I18nContext.current().translate('auth.EMAIL_PASSWORD_RECOVERY.FROM', {
          args: { email: 'captia@gmail.com' },
        }),
        subject: await I18nContext.current().translate('auth.EMAIL_PASSWORD_RECOVERY.SUBJECT'),
        template: 'password-recovery', // The `.pug`, `.ejs` or `.hbs` extension is appended automatically.
        context: {
          // Data to be sent to template engine.
          greetings: await I18nContext.current().translate(
            'auth.EMAIL_PASSWORD_RECOVERY.BODY.GREETINGS',
          ),
          msg_1: await I18nContext.current().translate(
            'auth.EMAIL_PASSWORD_RECOVERY.BODY.MSG_1_CONTEXT',
          ),
          msg_2: await I18nContext.current().translate(
            'auth.EMAIL_PASSWORD_RECOVERY.BODY.MSG_2_INSTRUCTIONS',
          ),
          username: passwordRecovey.user.username,
          token: passwordRecovey.token,
          servicePath:
            'http://localhost:3000/recoverPassword/' + passwordRecovey.token, // TODO : Get path from environment variable
          button_label: await I18nContext.current().translate(
            'auth.EMAIL_PASSWORD_RECOVERY.BODY.BUTTON_NEW_PASSWORD',
          ),
          msg_3: await I18nContext.current().translate(
            'auth.EMAIL_PASSWORD_RECOVERY.BODY.MSG_3_DISREGARD',
          ),
        },
      })
      .then(() => {
        // TODO: Centralize success mesaging and handling
        // console.log('Sucesso ao enviar email');
      })
      .catch(err => {
        // TODO: Centralize success mesaging and handling
        console.error(`Erro ao enviar email de recuperação de senha para : ${passwordRecovey.user.email}`);
        console.error(err);
      });
  }

  async sendEmailFirstAccessRequest(firstAccess: FirstAccess) {
    this.mailerService
      .sendMail({
        to: firstAccess.user.email,
        from: await I18nContext.current().translate('first_access.EMAIL_FIRST_ACCESS.FROM', {
          args: { email: 'captia@gmail.com' },
        }),
        subject: await I18nContext.current().translate('first_access.EMAIL_FIRST_ACCESS.SUBJECT'),
        template: join(process.cwd(), 'dist', 'templates', `first-access.pug`), // The `.pug`, `.ejs` or `.hbs` extension is appended automatically.
        context: {
          // Data to be sent to template engine.
          greetings: await I18nContext.current().translate(
            'first_access.EMAIL_FIRST_ACCESS.BODY.GREETINGS',
          ),
          msg_1: await I18nContext.current().translate(
            'first_access.EMAIL_FIRST_ACCESS.BODY.MSG_1_CONTEXT',
          ),
          msg_2: await I18nContext.current().translate(
            'first_access.EMAIL_FIRST_ACCESS.BODY.MSG_2_INSTRUCTIONS',
          ),
          username: firstAccess.user.username,
          token: firstAccess.token,
          servicePath: `${process.env.WEB_APP_URL}/first-access/${firstAccess.token}`,
          button_label: await I18nContext.current().translate(
            'first_access.EMAIL_FIRST_ACCESS.BODY.BUTTON_NEW_PASSWORD',
          ),
        },
      })
      .then(() => {
        console.debug('Sucesso ao enviar email!');
      })
      .catch(err => {
        console.error(`Erro ao enviar email de primeiro acesso para: ${firstAccess.user.email}`);
        console.error(err);
      });
  }
}
