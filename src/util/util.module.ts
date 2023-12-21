import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { settingsProviders as settingsProviders } from './providers/settings.providers';
import { UtilService } from './services/util.service';

@Module({
  imports: [DatabaseModule],
  providers: [...settingsProviders, UtilService],
  controllers: [],
  exports: [...settingsProviders, UtilService]
})
export class UtilModule { }
