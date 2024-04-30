import { Module } from '@nestjs/common';
import { CollaboratorsModule } from '../collaborators/collaborators.module';
import { CollaboratorsService } from '../collaborators/services/collaborators.service';
import { DatabaseModule } from './../database/database.module';
import { RolesModule } from './../roles/roles.module';
import { RolesService } from '../roles/services/roles.service';
import { UtilService } from '../util/services/util.service';
import { passwordRecoveryProviders } from './prroviders/password-recovery.providers';
import { PasswordRecoveryService } from './services/password-recovery.service';
import { UsersController } from './controllers/users.controller';
import { usersProviders } from "./prroviders/users.providers";
import { UsersService } from './services/users.service';
import { UtilModule } from '../util/util.module';
import { FirstAccessService } from './services/first-access.service';
import { firstAccessProviders } from './prroviders/first-access.providers';
import { EmailService } from '../email/email.service';
import { SegmentModule } from '../segment/segment.module';
import { SegmentService } from '../segment/services/segment.service';
import { ActiviteModule } from '../activities/activite.module';
import { ActivitesService } from '../activities/services/activite.service';

@Module({
  imports: [DatabaseModule, CollaboratorsModule, RolesModule, SegmentModule, UtilModule, ActiviteModule],
  providers: [...usersProviders, ...passwordRecoveryProviders, ...firstAccessProviders, 
    UsersService, PasswordRecoveryService, UtilService, CollaboratorsService, RolesService, FirstAccessService, EmailService, SegmentService, ActivitesService],
  controllers: [UsersController],
  exports: [...usersProviders, ...passwordRecoveryProviders, ...firstAccessProviders, UsersService]
})
export class UsersModule { }
