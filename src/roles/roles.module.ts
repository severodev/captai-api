import { Module } from '@nestjs/common';
import { DatabaseModule } from './../database/database.module';
import { rolesProviders } from './providers/roles.providers';
import { RolesService } from './services/roles.service';
import { RolesController } from './controllers/roles.controller';

@Module({
    imports: [DatabaseModule],
    providers: [
        ...rolesProviders,
        RolesService,
    ],
    controllers: [RolesController],
    exports: [...rolesProviders]
})
export class RolesModule { }
