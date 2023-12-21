import { Module } from '@nestjs/common';
import { DatabaseModule } from './../database/database.module';
import { LocationController } from './controllers/location.controller';
import { cityProviders } from './providers/city.providers';
import { stateProviders } from './providers/state.providers';
import { LocationService } from './service/location.service';

@Module({
  imports: [DatabaseModule],
  controllers: [LocationController],
  providers: [...cityProviders,
  ...stateProviders,
    LocationService],
  exports: [...cityProviders,
  ...stateProviders,
    LocationService],
})
export class LocationModule { }
