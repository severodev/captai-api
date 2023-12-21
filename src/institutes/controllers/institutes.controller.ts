import { Body, Controller, Get, Post, Req, UseFilters, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CollaboratorMonthlyReportDto } from '../../collaborators/interfaces/collaborator-monthly-report.dto';
import { AllExceptionsFilter } from '../../_filters/all-exceptions.filter';
import { InstituteReportService } from '../services/institute-report.service';
import { JwtAuthGuard } from './../../auth/jwt-auth.guard';
import { InstituteDropdownDto } from './../interfaces/institute-dropdown-dto';
import { InstitutesService } from './../services/institutes.service';

@UseGuards(JwtAuthGuard)
@ApiTags('Institutes')
@Controller('institutes')
@UseFilters(AllExceptionsFilter)
export class InstitutesController {

    constructor(private readonly instituteService: InstitutesService,
        private readonly instituteReportService: InstituteReportService) { }

    @Get('dropdown')
    dropdown(): Promise<InstituteDropdownDto[]> {
        return this.instituteService.dropdownList();
    }

    @Post('monthlyReport')
    monthlyReport(@Req() req: any, @Body() reportDto: CollaboratorMonthlyReportDto): Promise<any> {
        return this.instituteReportService.generateMonthlyReport(reportDto, req.auditEntry);
    }

}
