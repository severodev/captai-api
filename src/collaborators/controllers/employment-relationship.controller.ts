import { Controller, Get, UseFilters, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AllExceptionsFilter } from '../../_filters/all-exceptions.filter';
import { EmploymentRelationshipDropdownDto } from '../interfaces/employment-relationship-dropdown.dto';
import { EmploymentRelationshipService } from '../services/employment-relationship.service';
import { JwtAuthGuard } from './../../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@ApiTags('Emplyment Relationship')
@Controller('employmentrelationship')
@UseFilters(AllExceptionsFilter)
export class EmploymentRelationshipController {

    constructor(private employmentRelationshipService: EmploymentRelationshipService) { }

    @Get('dropdown')
    async dropdown(): Promise<EmploymentRelationshipDropdownDto[]> {
        return this.employmentRelationshipService.dropdown();
    }

}
