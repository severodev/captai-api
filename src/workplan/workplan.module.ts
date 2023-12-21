import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { SuppliersService } from '../suppliers/services/suppliers.service';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { WorkplanController } from './controllers/workplan.controller';
import { validityProviders } from './providers/validity.providers';
import { workplanItemProviders } from './providers/workplan-item.providers';
import { wpiFundPerMonthProviders } from './providers/wpi-fund-per-month.providers';
import { WorkplanService } from './services/workplan.service';

@Module({
  imports: [DatabaseModule, SuppliersModule],
  controllers: [WorkplanController],
  providers: [
    ...workplanItemProviders,
    ...validityProviders,
    ...wpiFundPerMonthProviders,
    SuppliersService,
    WorkplanService],
})
export class WorkplanModule {}
