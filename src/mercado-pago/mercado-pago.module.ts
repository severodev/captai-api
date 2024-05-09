import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { UtilModule } from '../util/util.module';
import { LinkPagamentoController } from './controllers/link-pagamento.controller';

@Module({
  imports: [DatabaseModule, UtilModule],
  providers: [],
  controllers: [LinkPagamentoController],
  exports: []
})
export class MercadoPagoModule { }