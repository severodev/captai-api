import { Global, Module } from '@nestjs/common';
import { AuditController } from './controller/audit.controller';
import { AuditService } from './service/audit.service';
import { auditProviders } from './providers/audit.providers';

@Global()
@Module({
  providers: [...auditProviders, AuditService],  
  controllers: [AuditController],
  exports: [AuditService]
})
export class AuditModule {}
