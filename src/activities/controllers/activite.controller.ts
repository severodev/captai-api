import { ActivitesService } from '../services/activite.service';
import { Controller, Get, UseFilters, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AllExceptionsFilter } from '../../_filters/all-exceptions.filter';
import { PaginationMetadataDto } from 'src/util/interfaces/pagination-metadata.dto';
import { ActiviteFilter } from '../interfaces/activite.filter';


@ApiTags('Activite')
@Controller('activities')
@UseFilters(AllExceptionsFilter)
export class ActiviteController {

    constructor(private readonly activiteService: ActivitesService) { }

    @Get()
    findAll(@Query() filter: ActiviteFilter, @Query() pageOptions: PaginationMetadataDto): any {
        return this.activiteService.findAll(filter, pageOptions);
    }

    @Get(':activiteId')
    findById(@Param('activiteId') activiteId : number): any {
        return this.activiteService.findOne(activiteId);
    }
}