import { Module } from '@nestjs/common';
import { permissionProviders } from './providers/permission.providers';
import { profileProviders } from './providers/profile.providers';
import { PermissionService } from './services/permission.service';
import { ProfilesService } from './services/profiles.service';
import { ProfilesController } from './controllers/profiles.controller';
import { PermissionsController } from './controllers/permissions.controller';

@Module({
    providers: [
        ...profileProviders,
        ...permissionProviders,
        ProfilesService,
        PermissionService,
    ],
    exports: [
        ...profileProviders,
        ...permissionProviders,
        ProfilesService,
        PermissionService
    ],
    controllers: [ProfilesController, PermissionsController]
})
export class ProfilesModule { }
