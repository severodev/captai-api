import { Controller, Get, UseFilters } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AllExceptionsFilter } from '../../_filters/all-exceptions.filter';
import { Institution } from '../entity/institution.entity';
import { InstitutionService } from '../services/institution.service';

@ApiTags('Institutions')
@Controller('institutions')
@UseFilters(AllExceptionsFilter)
export class InstitutionController {

    constructor(private readonly institutionService: InstitutionService) { }

    @Get('dropdown')
    dropdown(): Promise<Institution[]> {
        return this.institutionService.dropdownList();
    }

}
