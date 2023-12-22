import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import moment from "moment";
import { utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston';
import { AcceptLanguageResolver, HeaderResolver, I18nJsonLoader, I18nModule, QueryResolver } from 'nestjs-i18n';
import * as path from 'path';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { CollaboratorsModule } from './collaborators/collaborators.module';
import { CollaboratorsController } from './collaborators/controllers/collaborators.controller';
import { CollaboratorsService } from './collaborators/services/collaborators.service';
import { DocumentsController } from './documents/controllers/documents.controller';
import { DocumentsModule } from './documents/documents.module';
import { EmailService } from './email/email.service';
import { FileManagementModule } from './filemanagement/filemanagement.module';
import { InstitutesModule } from './institutes/institutes.module';
import { LocationModule } from './location/location.module';
import { ProjectModule } from './projects/projects.module';
import { RolesController } from './roles/controllers/roles.controller';
import { RolesModule } from './roles/roles.module';
import { RolesService } from './roles/services/roles.service';
import { S3Module } from './s3/s3.module';
import { ExpensesController } from './suppliers/controllers/expenses.controller';
import { ExpenseService } from './suppliers/services/expense.service';
import { SuppliersModule } from './suppliers/suppliers.module';
import { UsersController } from './users/controllers/users.controller';
import { PasswordRecoveryService } from './users/services/password-recovery.service';
import { UsersService } from './users/services/users.service';
import { UsersModule } from './users/users.module';
import { UtilModule } from './util/util.module';
import { UtilService } from './util/services/util.service';
import { WorkplanService } from './workplan/services/workplan.service';
import { WorkplanModule } from './workplan/workplan.module';
import { LoggerInterceptor } from './_interceptors/logger.interceptor';
import { ProjectsService } from './projects/services/projects.service';
import { PayrollService } from './collaborators/services/payroll.service';
import { ContributionsModule } from './modules/contributions/contributions.module';
import { LoanModule } from './modules/loan/loan.module';
import { FirstAccessService } from './users/services/first-access.service';
import { ProfilesModule } from './profiles/profiles.module';


const { combine, timestamp, label, printf } = winston.format;

// var winston = require('winston'),

// const BROWSER_DIR = join(process.cwd(), 'dist/browser');

const domino = require('domino');
const fs = require('fs');
// const template = fs.readFileSync(join(BROWSER_DIR , 'index.html')).toString()
const win = domino.createWindow('<h1>Hello world</h1>', 'http://example.com');

global['window'] = win;
global['Node'] = win.Node;
global['navigator'] = win.navigator;
global['Event'] = win.Event;
global['KeyboardEvent'] = win.Event;
global['MouseEvent'] = win.Event;
global['Event']['prototype'] = win.Event.prototype;
global['document'] = win.document;

const customLogFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env', }),
    MailerModule.forRoot({
      transport: process.env.MAILER_TRANSPORT,
      defaults: {
        from: `"${process.env.MAILER_DEFAULT_FROM_NAME}" <${process.env.MAILER_DEFAULT_FROM_MAIL}>`,

      },
      template: {
        dir: __dirname + '/templates',
        adapter: new PugAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: 'pt',
        loaderOptions: {
          path: path.join(__dirname, '/i18n/'),
          watch: true,
        },
      }),
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
        new HeaderResolver(['x-lang']),
      ],
      inject: [ConfigService],
    }),
    WinstonModule.forRoot({
      handleExceptions: true,
      format: combine(
        timestamp(),
        customLogFormat
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.splat(),
            nestWinstonModuleUtilities.format.nestLike(),
          ),
        }),
        new winston.transports.DailyRotateFile({
          filename: path.join('logs','captia-combined-%DATE%.log'),
          datePattern: 'DD-MMM-YYYY',
          level: 'debug',
          maxSize: '20m',
          format: winston.format.combine(winston.format.uncolorize()),
        }),
        new winston.transports.DailyRotateFile({
          filename: path.join('logs', 'errors', 'captia-errors-%DATE%.log'),
          datePattern: 'DD-MMM-YYYY',
          level: 'error',
          maxSize: '20m',
          format: winston.format.combine(winston.format.uncolorize()),
        }),
        // other transports...
      ],
      // other options
    }),
    ScheduleModule.forRoot(),
    AuthModule, UsersModule, UtilModule, CollaboratorsModule, RolesModule,
    InstitutesModule, ProjectModule, S3Module, FileManagementModule,
    DocumentsModule, LocationModule, AuditModule, SuppliersModule, WorkplanModule,
    UtilModule,
    ContributionsModule,
    LoanModule,
    ProfilesModule],
  controllers: [AppController, CollaboratorsController, RolesController, 
    UsersController, DocumentsController, ExpensesController],
  providers: [AppService, CollaboratorsService, RolesService, UsersService, UtilService, PayrollService,
    ExpenseService, PasswordRecoveryService, EmailService, ProjectsService, FirstAccessService, WorkplanService, {
      provide: 'MomentWrapper',
      useValue: moment
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    }
  ],
})
export class AppModule { }
