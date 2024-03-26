import { Module } from '@nestjs/common';
import { editaisProviders } from './providers/edital.providers';
import { EditalsService } from './services/edital.service';
import { EditalController } from './controllers/edital.controller';

@Module({
    providers: [
        ...editaisProviders,
        EditalsService,
    ],
    exports: [
        ...editaisProviders,
        EditalsService
    ],
    controllers: [EditalController]
})
export class EditalModule { }
