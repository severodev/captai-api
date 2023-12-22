/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { BadRequestException, Body, Controller, Delete, Get, InternalServerErrorException, Param, Post, Put, Query, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { AllExceptionsFilter } from '../../_filters/all-exceptions.filter';
import { Collaborator } from '../entity/collaborator.entity';
import { CollaboratorCardDto } from '../interfaces/collaborator-card.dto';
import { CollaboratorCSVReport } from '../interfaces/collaborator-csv-report.dto';
import { CollaboratorDropdownDto } from '../interfaces/collaborator-dropdown.dto';
import { CreateCollaboratorDto } from '../interfaces/create-collaborator.dto';
import { UpdateAllPaymentsStatusDto } from '../interfaces/update-all-payments-status.dto';
import { UpdateCollaboratorDto } from '../interfaces/update-collaborator.dto';
import { BenefitsService } from '../services/benefits.service';
import { CollaboratorsService } from '../services/collaborators.service';
import { EmploymentRelationshipService } from '../services/employment-relationship.service';
import { PayrollService } from '../services/payroll.service';
import { JwtAuthGuard } from './../../auth/jwt-auth.guard';
import { Roles } from './../../roles/roles.decorator';
import { PaginationMetadataDto } from './../../util/interfaces/pagination-metadata.dto';

@ApiTags('Collaborators')
@UseGuards(JwtAuthGuard)
@Controller('collaborators')
@UseFilters(AllExceptionsFilter)
export class CollaboratorsController {

    constructor(private collaboratorsService: CollaboratorsService,
        private benefitsService: BenefitsService,
        private readonly payrollService: PayrollService,
        private employmentRelationshipService: EmploymentRelationshipService) { }

    @Roles('ADMIN', 'GERENTE', 'COORDENADOR_ADM', 'ANALISTA_ADM', 'ASSISTENTE_ADM', 'ESTAG_ADM', 'ANALISTA_FIN','ESTAG_FIN','ESTAG_DP','ESTAG_OFI')
    @Get('pagination')
    async cardsPages(@Query('search') search: string,
        @Query('itemsPerPage') itemsPerPage = 10,
        @Query('isActive') isActive = true, @Query('filters') filters: any): Promise<PaginationMetadataDto> {
        return this.collaboratorsService.pagination(search, itemsPerPage, isActive, filters);
    }

    @Roles('ADMIN', 'GERENTE', 'COORDENADOR_ADM', 'ANALISTA_ADM', 'ASSISTENTE_ADM', 'ESTAG_ADM', 'ANALISTA_FIN','ESTAG_FIN','ESTAG_DP','ESTAG_OFI')
    @Get('dropdown')
    async dropdown(@Query('search') search: string): Promise<CollaboratorDropdownDto[]> {
        return this.collaboratorsService.filteredCompact(search, true);
    }

    @Roles('ADMIN', 'GERENTE', 'COORDENADOR_ADM', 'ANALISTA_ADM', 'ASSISTENTE_ADM', 'ESTAG_ADM', 'ANALISTA_FIN','ESTAG_FIN','ESTAG_DP','ESTAG_OFI')
    @Get('')
    async findByName(@Query('name') name: string): Promise<Collaborator> {
        return this.collaboratorsService.findByName(name);
    }
    
    @Roles('ADMIN', 'GERENTE', 'COORDENADOR_ADM', 'ANALISTA_ADM', 'ASSISTENTE_ADM', 'ESTAG_ADM', 'ANALISTA_FIN','ESTAG_FIN','ESTAG_DP','ESTAG_OFI')
    @Get('checkCpf')
    async findByCpf(@Query('cpf') cpf: string): Promise<boolean> {
        return this.collaboratorsService.findByCpf(cpf);
    }

    @Roles('ADMIN', 'GERENTE', 'COORDENADOR_ADM', 'ANALISTA_ADM', 'ASSISTENTE_ADM', 'ESTAG_ADM', 'ANALISTA_FIN','ESTAG_FIN','ESTAG_DP','ESTAG_OFI')
    @Get('cards')
    async cards(@Query('search') search, @Query('orderby') orderby,
        @Query('desc') desc: number, @Query('itemsPerPage') itemsPerPage = 10,
        @Query('page') page = 1, @Query('isActive') isActive = true,
        @Query('filters') filters: any): Promise<CollaboratorCardDto[]> {
        return this.collaboratorsService.filteredCards(search, orderby, (desc && desc > 0), itemsPerPage, page, isActive, filters);
    }

    @Roles('ADMIN', 'GERENTE', 'COORDENADOR_ADM', 'ANALISTA_ADM', 'ASSISTENTE_ADM', 'ESTAG_ADM', 'ANALISTA_FIN','ESTAG_FIN','ESTAG_DP','ESTAG_OFI')
    @Get('csv')
    async csv(@Query('search') search, @Query('orderby') orderby,
        @Query('desc') desc: number, @Query('itemsPerPage') itemsPerPage = 10,
        @Query('page') page = 1, @Query('filters') filters: any, @Res() res, @I18n() i18n: I18nContext) {

        const csvReport: CollaboratorCSVReport = await this.collaboratorsService.csv(search, orderby,
            (desc && desc > 0), itemsPerPage, page, filters, i18n);
        if (csvReport) {
            res.attachment(csvReport.filename);
            return res.status(200).send(csvReport.content);
        } else {
            throw new InternalServerErrorException("Falha ao gerar relatório");
        }
    }

    @ApiBearerAuth()
    @Roles('ADMIN', 'GERENTE', 'COORDENADOR_ADM', 'ANALISTA_ADM', 'ASSISTENTE_ADM', 'ESTAG_ADM', 'ANALISTA_FIN','ESTAG_FIN','ESTAG_DP','ESTAG_OFI')
    @ApiOperation({ summary: 'Creates a new collaborator' })
    @ApiResponse({
        status: 201
    })
    @Post()
    async create(@Req() req: any, @Body() createCollaboratorDto: CreateCollaboratorDto) {
        return this.collaboratorsService.create(createCollaboratorDto, req.auditEntry);
    }

    @Put('confirmAllHRPayments')
    async confirmAllHRPayments(@Req() req: any, @Body() updateAllPaymentsStatusDto: UpdateAllPaymentsStatusDto, @I18n() i18n: I18nContext) {
        return this.payrollService.confirmAllHRPayments(updateAllPaymentsStatusDto, i18n, req.auditEntry);
    }

    @ApiOperation({ summary: 'Updates an existing collaborator' })
    @ApiResponse({
        status: 200
    })
    @Put(':id')
    async update(@Req() req: any, @Param('id') id: number, @Body() updateCollaboratorDto: UpdateCollaboratorDto) {

        if(updateCollaboratorDto.id && updateCollaboratorDto.id > 0 && updateCollaboratorDto.id != id){
            throw new BadRequestException(
                await I18nContext.current().translate('collaborator.ID_MISMATCH', {
                    args: { id: updateCollaboratorDto.id },
                })
            );
        }

        return this.collaboratorsService.update(updateCollaboratorDto, req.auditEntry);
    }

    @ApiBearerAuth()
    @Roles('ADMIN', 'GERENTE', 'COORDENADOR_ADM', 'ANALISTA_ADM', 'ASSISTENTE_ADM')
    @ApiOperation({ summary: 'Get information about an existing collaborator' })
    @ApiResponse({
        status: 200
    })
    @Get(':id')
    async getById(@Req() req: any, @Param('id') id: number, @I18n() i18n: I18nContext) {
        return this.collaboratorsService.getById(id, i18n, req.auditEntry);
    }

    @ApiBearerAuth()
    @Roles('ADMIN', 'GERENTE', 'COORDENADOR_ADM', 'ANALISTA_ADM', 'ASSISTENTE_ADM')
    @ApiOperation({ summary: 'Deletes an existing collaborator' })
    @ApiResponse({
        status: 200
    })
    @Delete(':id')
    async delete(@Req() req: any, @Param('id') id: number, @I18n() i18n: I18nContext) {
        return this.collaboratorsService.delete(id, i18n, req.auditEntry);
    }

    @ApiBearerAuth()
    @Roles('ADMIN', 'GERENTE', 'COORDENADOR_ADM', 'ANALISTA_ADM', 'ASSISTENTE_ADM')
    @ApiOperation({ summary: 'Activates a deleted collaborator' })
    @ApiResponse({
        status: 200
    })
    @Post(':id/activate')
    async activate(@Req() req: any, @Param('id') id: number, @I18n() i18n: I18nContext) {
        return this.collaboratorsService.activate(id, i18n, req.auditEntry);
    }

    @ApiBearerAuth()
    @Roles('ADMIN', 'GERENTE', 'COORDENADOR_ADM', 'ANALISTA_ADM', 'ASSISTENTE_ADM', 'COLABORADOR')
    @ApiOperation({ summary: 'Get the list of projects a given collaborator is related to' })
    @ApiResponse({
        status: 200
    })
    @Get(':id/projects')
    async getCollaboratorsProjectList(@Req() req: any, @Param('id') id: number) {
        return this.payrollService.getProjectsByPayroll(id);
    }

    @ApiBearerAuth()
    @Roles('ADMIN', 'GERENTE', 'COORDENADOR_ADM', 'ANALISTA_ADM', 'ASSISTENTE_ADM', 'COLABORADOR')
    @ApiOperation({ summary: 'Get the list of projects a given collaborator is related to' })
    @ApiResponse({
        status: 200
    })
    @Get(':id/monthlyReportOverview')
    async getReportsReview(@Req() req: any, @Param('id') id: number) {
        if(req.auditEntry.userId != id && (req.auditEntry.userRole && req.auditEntry.userRole == 'COLABORADOR')){
            throw new InternalServerErrorException("This user cannot access someone else's Month Report.");
        }
        return this.collaboratorsService.getMonthReportsOverview(id);
    }

    @Put(':id/confirmHRPayment/:paymentId')
    async confirmHRPayment(@Req() req: any, @Param('paymentId') paymentId: number, @I18n() i18n: I18nContext) {
        return this.payrollService.confirmHRPayment(paymentId, i18n, req.auditEntry);
    }


}
