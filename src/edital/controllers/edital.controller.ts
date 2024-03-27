import { EditalsService } from '../services/edital.service';
import { Controller, Get, UseFilters, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AllExceptionsFilter } from '../../_filters/all-exceptions.filter';
import { PaginationMetadataDto } from 'src/util/interfaces/pagination-metadata.dto';
import { EditalFilter } from '../interfaces/edital.filter';


@ApiTags('Editais')
@Controller('edital')
@UseFilters(AllExceptionsFilter)
export class EditalController {

    constructor(private readonly editalService: EditalsService) { }

    @Get()
    findAll(@Query() filter: EditalFilter, @Query() pageOptions: PaginationMetadataDto): any {
        return this.editalService.findAll(filter, pageOptions);
    }

    @Get(':editalId')
    findById(@Param('editalId') editalId : number): any {
        return this.editalService.findOne(editalId);
    }
}