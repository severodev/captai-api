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
        to: passwordRecovey.user.email,
        from: await I18nContext.current().translate('auth.EMAIL_PASSWORD_RECOVERY.FROM', {
          args: { email: process.env.MAILER_DEFAULT_FROM_MAIL },
        }),
        subject: await I18nContext.current().translate('auth.EMAIL_PASSWORD_RECOVERY.SUBJECT'),
        template: join(process.cwd(), 'dist', 'templates', `password-recovery.pug`),
        context: {
          username: passwordRecovey.user.name,
          token: passwordRecovey.token,
          servicePath:`${process.env.WEB_APP_URL}/password-recovery/${passwordRecovey.token}`,
        },
      })
      .then(() => {
        // TODO: Centralize success mesaging and handling
        console.log('Sucesso ao enviar email');
      })
      .catch(err => {
        // TODO: Centralize success mesaging and handling
        console.error(`Erro ao enviar email de recuperação de senha para : ${passwordRecovey.user.email}`);
        console.error(err);
      });
  }

  async sendEmailValidateEmail(firstAccess: FirstAccess) {
    try {

      this.mailerService
      .sendMail({
        to: firstAccess.user.email,
        from: await I18nContext.current().translate('auth.EMAIL_ACCOUNT_ACTIVATION.FROM', {
          args: { email: process.env.MAILER_DEFAULT_FROM_MAIL },
        }),
        subject: await I18nContext.current().translate('auth.EMAIL_ACCOUNT_ACTIVATION.SUBJECT'),
        template: join(process.cwd(), 'dist', 'templates', `validate-email`),
        context: {
          token: firstAccess.token,
          username: firstAccess.user.name,
          servicePath:`${process.env.WEB_APP_URL}/validate-email/${firstAccess.token}`,
        },
      })
      .then(() => {
        // TODO: Centralize success mesaging and handling
        console.log('Sucesso ao enviar email');
      })
      .catch(err => {
        // TODO: Centralize success mesaging and handling
        console.error(`Erro ao enviar email de validação de conta para : ${firstAccess.user.email}`);
        console.error(err);
      });
    } catch(error) {
        console.error(`Erro GERAL ao enviar email de validação de conta para : ${firstAccess.user.email}`);
        console.error(error);
    }
  }

  async sendEmailFirstAccessRequest(firstAccess: FirstAccess) {
    this.mailerService
      .sendMail({
        to: firstAccess.user.email,
        from: await I18nContext.current().translate('auth.EMAIL_PASSWORD_RECOVERY.FROM', {
          args: { email: process.env.MAILER_DEFAULT_FROM_MAIL },
        }),
        subject: await I18nContext.current().translate('auth.EMAIL_PASSWORD_RECOVERY.SUBJECT'),
        template: join(process.cwd(), 'dist', 'templates', `password-recovery.pug`),
        context: {
          username: firstAccess.user.name,
          token: firstAccess.token,
          servicePath: `${process.env.WEB_APP_URL}/password-recovery/${firstAccess.token}`,
        },
      })
      .then(() => {
        console.debug('Sucesso ao enviar email de recuperação de senha!');
      })
      .catch(err => {
        console.error(`Erro ao enviar email de primeiro acesso para: ${firstAccess.user.email}`);
        console.error(err);
      });
  }

  async sendGuestInvite(firstAccess: FirstAccess) {
    this.mailerService
      .sendMail({
        to: firstAccess.user.email,
        from: await I18nContext.current().translate('auth.EMAIL_GUEST_INVITE.FROM', {
          args: { email: process.env.MAILER_DEFAULT_FROM_MAIL },
        }),
        subject: await I18nContext.current().translate('auth.EMAIL_GUEST_INVITE.SUBJECT'),
        template: join(process.cwd(), 'dist', 'templates', `guest-invite.pug`),
        context: {
          username: firstAccess.user.name,
          token: firstAccess.token,
          servicePath: `${process.env.WEB_APP_URL}/password-recovery/${firstAccess.token}`,
        },
      })
      .then(() => {
        console.debug('Sucesso ao enviar email convite!');
      })
      .catch(err => {
        console.error(`Erro ao enviar email de convite para : ${firstAccess.user.email}`);
        console.error(err);
      });
  }
}
