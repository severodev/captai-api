import { Module } from '@nestjs/common';
import { LoanService } from './services/loan.service';
import { LoanController } from './controllers/loan.controller';
import { loanProviders } from './providers/loan.providers';
import { ProjectModule } from '../../projects/projects.module';

@Module({
  imports : [ProjectModule],
  controllers: [LoanController],
  providers: [
    ...loanProviders,
    LoanService
  ]
})
export class LoanModule {}
