import { Controller, Get, Query, UseGuards, LoggerService, Inject, UseFilters } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CityDto } from '../interfaces/city.dto';
import { StateDto } from '../interfaces/state.dto';
import { LocationService } from '../service/location.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { AllExceptionsFilter } from '../../_filters/all-exceptions.filter';
import { StateFilter } from '../interfaces/stateFilter';
import { PaginationMetadataDto } from 'src/util/interfaces/pagination-metadata.dto';



@ApiTags('Locations')
@Controller('location')
@UseFilters(AllExceptionsFilter)
export class LocationController {

    constructor(
        private readonly locationService: LocationService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) { }

    @ApiOperation({ summary: 'List of cities for input fields and dropdowns. Accepts state filtering' })
    @ApiResponse({
        status: 200,
        type: CityDto,
        isArray: true
    })
    @UseGuards(JwtAuthGuard)
    @Get('city/dropdown')
    async cityDropdown(@Query('state') state = 6): Promise<CityDto[]> {
        return this.locationService.cityDropdown(state);
    }

    @ApiOperation({ summary: 'List of state for input fields and dropdowns. Accepts country filtering (default = Brasil)' })
    @UseGuards(JwtAuthGuard)
    @ApiResponse({
        status: 200,
        type: StateDto,
        isArray: true
    })
    @Get('state/dropdown')
    async stateDropdown(@Query('country') country = 1): Promise<StateDto[]> {
        return this.locationService.stateDropdown(country);
    }

    @Get()
    findAll(@Query() filter: StateFilter, @Query() pageOptions: PaginationMetadataDto): any {
        return this.locationService.findAllStates(filter, pageOptions);
    }
}
