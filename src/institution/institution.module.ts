import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { institutionProviders } from './providers/institution.providers';
import { InstitutionService } from './services/institution.service';
import { InstitutionController } from './controllers/institution.controller';

@Module({
    imports: [DatabaseModule, HttpModule],
    providers: [
        ...institutionProviders,
        InstitutionService
    ],
    exports: [...institutionProviders, 
        InstitutionService
    ],
    controllers: [
        InstitutionController
    ]
})
export class InstitutionModule {}
