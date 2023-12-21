import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../roles/roles.decorator';
import { AllExceptionsFilter } from '../../_filters/all-exceptions.filter';
import { CreateWorkplanItemDto } from '../interfaces/create/create-workplan-item.dto';
import { WorkplanItemDto } from '../interfaces/workplan-item.dto';
import { WorkplanPlannedItemDto } from '../interfaces/workplan-planned-item.dto';
import { WorkplanService } from '../services/workplan.service';

@UseGuards(JwtAuthGuard)
@ApiTags('Workplan')
@Controller('workplan')
@UseFilters(AllExceptionsFilter)
export class WorkplanController {

    constructor(
        private workplanService: WorkplanService) { }

    @ApiBearerAuth()
    @Roles('ADMIN', 'GERENTE', 'COORDENADOR_ADM', 'ANALISTA_ADM', 'ASSISTENTE_ADM', 'ESTAG_ADM', 'ANALISTA_FIN','ESTAG_FIN','ESTAG_DP','ESTAG_OFI')
    @Get('validity')
    async getValidityList() {
        return this.workplanService.getValidityList();
    }

    @ApiBearerAuth()
    @Roles('ADMIN', 'GERENTE', 'COORDENADOR_ADM', 'ANALISTA_ADM', 'ASSISTENTE_ADM', 'ESTAG_ADM', 'ANALISTA_FIN','ESTAG_FIN','ESTAG_DP','ESTAG_OFI')
    @ApiOperation({ summary: 'Creates a new workplan item' })
    @ApiResponse({
        status: 201,
        type: WorkplanItemDto,
        isArray: true,
        description: 'Representation of the created workplan item'
    })
    @Post()
    async create(@Req() req: any, @Body() createWorkplanItemDto: CreateWorkplanItemDto) {
        return this.workplanService.create(createWorkplanItemDto, req.auditEntry);
    }

    @ApiBearerAuth()
    @Roles('ADMIN', 'GERENTE', 'COORDENADOR_ADM', 'ANALISTA_ADM', 'ASSISTENTE_ADM', 'ESTAG_ADM', 'ANALISTA_FIN','ESTAG_FIN','ESTAG_DP','ESTAG_OFI')
    @ApiOperation({ summary: 'Updates an existing workplan item' })
    @ApiResponse({
        status: 200,
        type: WorkplanItemDto,
        isArray: true,
        description: 'Representation of the updated workplan item'
    })
    @Put(':id')
    async update(@Req() req: any, @Body() workplanItemDto: WorkplanItemDto) {
        return this.workplanService.update(workplanItemDto, req.auditEntry);
    }

    @ApiBearerAuth()
    @Roles('ADMIN','GERENTE','COORDENADOR_ADM','ANALISTA_ADM','ASSISTENTE_ADM')
    @ApiOperation({ summary: 'Gets an existing workplan item' })
    @ApiResponse({
        status: 200,
        type: WorkplanItemDto,
        isArray: false,
        description: 'A Workplan item'
    })
    @Get(':id')
    async get(@Req() req: any, @Param('id') id: number, @I18n() i18n: I18nContext) {
        return this.workplanService.getById(id, i18n);
    }

    @ApiBearerAuth()
    @Roles('ADMIN','GERENTE','COORDENADOR_ADM','ANALISTA_ADM','ASSISTENTE_ADM')
    @ApiOperation({ summary: 'Gets all workplan items from a project' })
    @ApiResponse({
        status: 200,
        type: WorkplanItemDto,
        isArray: true,
        description: 'List of all workplan items of a project'
    })
    @Get('project/:projectId')
    async getByProject(@Req() req: any, @Param('projectId') id: number, @I18n() i18n: I18nContext) {
        return this.workplanService.getByProject(id, i18n);
    }

    @ApiBearerAuth()
    @Roles('ADMIN', 'GERENTE', 'COORDENADOR_ADM', 'ANALISTA_ADM', 'ASSISTENTE_ADM', 'ESTAG_ADM', 'ANALISTA_FIN','ESTAG_FIN','ESTAG_DP','ESTAG_OFI')
    @ApiOperation({ summary: 'Brings all planned work plans.' })
    @ApiResponse({
        status: 200,
        type: WorkplanPlannedItemDto,
        isArray: true,
        description: 'List of all workplan items of a project, but the way to be used directly on the front.'
    })
    @Get('planned/project/:projectId')
    async workplanPlannedByProject(@Req() req: any, @Param('projectId') id: number, @I18n() i18n: I18nContext) {
        return this.workplanService.workplanPlannedByProject(id, i18n);
    }

    @ApiBearerAuth()
    @Roles('ADMIN', 'GERENTE', 'COORDENADOR_ADM', 'ANALISTA_ADM', 'ASSISTENTE_ADM', 'ESTAG_ADM', 'ANALISTA_FIN','ESTAG_FIN','ESTAG_DP','ESTAG_OFI')
    @ApiOperation({ summary: 'Deletes an existing workplan item' })
    @ApiResponse({
        status: 200
    })
    @Delete(':id')
    async delete(@Req() req: any, @Param('id') id: number, @I18n() i18n: I18nContext) {
        return this.workplanService.delete(id, i18n, req.auditEntry);
    }

    @ApiBearerAuth()
    @Roles('ADMIN', 'GERENTE', 'COORDENADOR_ADM', 'ANALISTA_ADM', 'ASSISTENTE_ADM')
    @ApiOperation({ summary: 'Activates a deleted workplan item' })
    @ApiResponse({
        status: 200
    })
    @Post(':id/activate')
    async activate(@Req() req: any, @Param('id') id: number, @I18n() i18n: I18nContext) {
        return this.workplanService.activate(id, i18n, req.auditEntry);
    }

}
