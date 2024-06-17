import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { UtilModule } from '../util/util.module';
import { SubscriptionController } from './controllers/subscription.controller';

@Module({
  imports: [DatabaseModule, UtilModule],
  providers: [],
  controllers: [SubscriptionController],
  exports: []
})
export class MercadoPagoModule { }