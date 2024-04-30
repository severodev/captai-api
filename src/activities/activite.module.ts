import { Module } from '@nestjs/common';
import { ActiviteController } from './controllers/activite.controller';
import { ActivitesService } from './services/activite.service';
import { activiteProviders } from './providers/activite.providers';


@Module({
    providers: [
        ...activiteProviders,
        ActivitesService,
    ],
    exports: [
        ...activiteProviders,
        ActivitesService
    ],
    controllers: [ActiviteController]
})
export class ActiviteModule { }
