import { Module } from '@nestjs/common';
import { ContributionsService } from './services/contributions.service';
import { ContributionsController } from './controllers/contributions.controller';
import { contributionProviders } from './providers/contribution.providers';
import { ProjectModule } from '../../projects/projects.module';

@Module({
  imports : [ProjectModule],
  controllers: [ContributionsController],
  providers: [
    ...contributionProviders,
    ContributionsService,
    
  ]
})
export class ContributionsModule {}
