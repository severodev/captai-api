/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, Req, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { AllExceptionsFilter } from '../../_filters/all-exceptions.filter';
import { CreateProjectMemberDto } from '../interfaces/create-project-member.dto';
import { CreateProjectDto } from '../interfaces/create-project.dto';
import { GroupedProjectCardDto } from '../interfaces/grouped-project-card.dto';
import { ProjectCardDto } from '../interfaces/project-card.dto';
import { ProjectDropdownDto } from '../interfaces/project-dropdown.dto';
import { UpdateProjectDto } from '../interfaces/update-project.dto';
import { ProjectMemberService } from '../services/project-member.service';
import { ProjectsService } from '../services/projects.service';
import { JwtAuthGuard } from './../../auth/jwt-auth.guard';
import { Roles } from './../../roles/roles.decorator';
import { PaginationMetadataDto } from './../../util/interfaces/pagination-metadata.dto';
import * as moment from 'moment';

@UseGuards(JwtAuthGuard)
@ApiTags('Projects')
@Controller('projects')
@UseFilters(AllExceptionsFilter)
export class ProjectsController {

    constructor(
        private readonly projectsService: ProjectsService,
        private readonly projectMemberService: ProjectMemberService
    ) { }

    @Roles('ADMIN', 'GERENTE', 'COORDENADOR_ADM', 'ANALISTA_ADM', 'ASSISTENTE_ADM', 'ESTAG_ADM', 'ANALISTA_FIN','ESTAG_FIN','ESTAG_DP','ESTAG_OFI')
    @ApiOperation({ summary: 'Returns projects pagination metadata' })
    @ApiResponse({
        status: 200,
        type: PaginationMetadataDto,
    })
    @Get('pagination')
    async pagination(@Query('search') search: string, 
        @Query('itemsPerPage') itemsPerPage = 10,
        @Query('isActive') isActive = true): Promise<PaginationMetadataDto> {
        return this.projectsService.pagination(search, itemsPerPage, isActive);
    }

    @Roles('ADMIN', 'GERENTE', 'COORDENADOR_ADM', 'ANALISTA_ADM', 'ASSISTENTE_ADM', 'ESTAG_ADM', 'ANALISTA_FIN','ESTAG_FIN','ESTAG_DP','ESTAG_OFI')
    @ApiOperation({ summary: 'Project cards grouped by institute. Accepts text filtering, name|date sorting and pagination (institutes excluded).' })
    @ApiResponse({
        status: 200,
        description: 'A list of projects grouped by institute (alphabetically sorted) containing ID, name, remaining budget and progress (decimal format)',
        type: GroupedProjectCardDto,
        isArray: true
    })
    @Get('groupedCards')
    async groupedCards(@Query('search') search: string, @Query('orderby') orderby, @Query('desc') desc: number,
        @Query('itemsPerPage') itemsPerPage = 100, @Query('page') page = 0): Promise<GroupedProjectCardDto[] | ProjectCardDto[]> {

        const groupedCards: GroupedProjectCardDto[] = [];
        const projects = await this.projectsService.filteredCards(search, orderby, (desc && desc > 0), itemsPerPage, page, true);

        // Building card structure
        projects.forEach(p => {
            let instituteProjects = groupedCards.find(instProjects => instProjects.institute.id === p.institute.id);
            if (!instituteProjects) {
                instituteProjects = new GroupedProjectCardDto();
                instituteProjects.institute = { id: p.institute.id, abbreviation: p.institute.abbreviation, name: p.institute.name };
                instituteProjects.projects = [];
                // instituteProjects.workplanComplete = p.workplan && p.workplan.length > 0

                groupedCards.push(instituteProjects);
            }

            instituteProjects.projects.push({
                id: p.id, name: p.name,
                remainingBudget: p.lastMargin,
                progress: p.progress,
                workplanComplete: p.workplan && p.workplan.length > 0,
                totalMembers: p.totalMembers,
                totalExpensives: p.budget - p.lastMargin,
                utilizedFundsPercentage: p.utilizedFundsPercentage
            });
        });

        // Ordering institutes
        groupedCards.sort((e1, e2) => e1.institute.abbreviation.localeCompare(e2.institute.abbreviation));
        return groupedCards;

    }

    @Roles('ADMIN', 'GERENTE', 'COORDENADOR_ADM', 'ANALISTA_ADM', 'ASSISTENTE_ADM', 'ESTAG_ADM', 'ANALISTA_FIN','ESTAG_FIN','ESTAG_DP','ESTAG_OFI')
    @ApiOperation({ summary: 'Returns which institute the project in question belongs to.' })
    @ApiResponse({
        status: 200,
        description: 'returns only an object with the institute string.',
    })
    @Get('findInstituteByProjectId/:id')
    async findInstituteByProjectId(@Param('id') id: number): Promise<any> {
        return await this.projectsService.findInstituteByProjectId(id);
    }

    @Roles('ADMIN', 'GERENTE', 'COORDENADOR_ADM', 'ANALISTA_ADM', 'ASSISTENTE_ADM', 'ESTAG_ADM', 'ANALISTA_FIN','ESTAG_FIN','ESTAG_DP','ESTAG_OFI')
    @ApiOperation({ summary: 'Project cards. Accepts text filtering, name|date sorting and pagination.' })
    @ApiResponse({
        status: 200,
        description: 'A list of projects containing ID, name, remaining budget and progress (decimal format)',
        type: ProjectCardDto,
        isArray: true
    })
    @Get('cards')
    async cards(@Query('search') search: string, @Query('orderby') orderby, @Query('desc') desc: number,
        @Query('itemsPerPage') itemsPerPage = 10, @Query('page') page = 1,
        @Query('isActive') isActive = true): Promise<ProjectCardDto[]> {

        const projects = await this.projectsService.filteredCards(search, orderby, (desc && desc > 0), itemsPerPage, page, isActive);
        const cards: ProjectCardDto[] = projects.map(p => <ProjectCardDto>{
            id: p.id, name: p.name,
            remainingBudget: p.lastMargin,
            progress: p.progress,
            workplanComplete: p.workplan && p.workplan.length > 0,
            totalMembers: p.totalMembers,
            remainingMarginPercentage: p.remainingMarginPercentage,
            utilizedFundsPercentage: p.utilizedFundsPercentage,
            institute: p.institute
        });

        return cards;
    }

    @Roles('ADMIN', 'GERENTE', 'COORDENADOR_ADM', 'ANALISTA_ADM', 'ASSISTENTE_ADM', 'ESTAG_ADM', 'ANALISTA_FIN','ESTAG_FIN','ESTAG_DP','ESTAG_OFI')
    @ApiOperation({ summary: 'Lean list of projects for input fields and dropdowns. Not filterable.' })
    @ApiResponse({
        status: 200,
        type: ProjectDropdownDto,
        isArray: true
    })
    @Get('dropdown')
    async dropdown(@Query('filters') filters: any): Promise<ProjectDropdownDto[]> {
        return this.projectsService.filteredCompact(null, true, filters);
    }

    @ApiBearerAuth()
    @Roles('ADMIN', 'GERENTE', 'COORDENADOR_ADM', 'ANALISTA_ADM', 'ASSISTENTE_ADM', 'ESTAG_ADM', 'ANALISTA_FIN','ESTAG_FIN','ESTAG_DP','ESTAG_OFI')
    @ApiOperation({ summary: 'Creates a new project' })
    @ApiResponse({
        status: 201
    })
    @ApiBody({type: CreateProjectDto})
    @Post()
    async create(@Req() req: any, @Body() createProjectDto: CreateProjectDto) {
        return this.projectsService.create(createProjectDto, req.auditEntry);
    }

    @ApiBearerAuth()
    @Roles('ADMIN', 'GERENTE', 'COORDENADOR_ADM', 'ANALISTA_ADM', 'ASSISTENTE_ADM')
    @ApiOperation({ summary: 'Get information about an existing collaborator' })
    @ApiResponse({
        status: 200
    })
    @Get(':id/:expenseStatus')
    async getById(@Req() req: any, @Param('id') id: number,@Param('expenseStatus') expenseStatus: string,  @I18n() i18n: I18nContext) {
        return await this.projectsService.getById(id, expenseStatus, i18n, req.auditEntry);
    }

    // @ApiBearerAuth()
    @Roles('ADMIN', 'GERENTE', 'COORDENADOR_ADM', 'ANALISTA_ADM', 'ASSISTENTE_ADM', 'ESTAG_ADM', 'ANALISTA_FIN','ESTAG_FIN','ESTAG_DP','ESTAG_OFI')
    @ApiOperation({ summary: 'Updates an existing project' })
    @ApiResponse({
        status: 200
    })
    @Put(':id')
    async update(@Req() req: any, @Param('id', ParseIntPipe) id: number, @Body() updateProjectDto: UpdateProjectDto) {

        if (updateProjectDto.id && updateProjectDto.id > 0 && updateProjectDto.id !== id) {
            throw new BadRequestException(
                await I18nContext.current().translate('project.ID_MISMATCH', {
                    args: { id: updateProjectDto.id },
                })
            );
        }

        updateProjectDto.id = id;
        return this.projectsService.update(updateProjectDto, req.auditEntry);
    }

    @ApiBearerAuth()
    @Roles('ADMIN','GERENTE','COORDENADOR_ADM','ANALISTA_ADM','ASSISTENTE_ADM')
    @ApiOperation({ summary: 'Deletes an existing project' })
    @ApiResponse({
        status: 200
    })
    @Delete(':id')
    async delete(@Req() req: any, @Param('id') id: number) {
        return this.projectsService.delete(id, req.auditEntry);
    }

    @ApiBearerAuth()
    @Roles('ADMIN','GERENTE','COORDENADOR_ADM','ANALISTA_ADM','ASSISTENTE_ADM')
    @ApiOperation({ summary: 'Deataches a collaborator from an existing project' })
    @ApiResponse({
        status: 200
    })
    @Delete(':pid/member/:cid')
    async removeProjectMember(@Req() req: any, @Param('pid') projectId: number,@Param('cid') collaboratorId: number) {
        return this.projectMemberService.removeProjectMember(projectId, collaboratorId, req.auditEntry);
    }

    @ApiBearerAuth()
    @Roles('ADMIN', 'GERENTE', 'COORDENADOR_ADM', 'ANALISTA_ADM', 'ASSISTENTE_ADM', 'ESTAG_ADM', 'ANALISTA_FIN','ESTAG_FIN','ESTAG_DP','ESTAG_OFI')
    @ApiOperation({ summary: 'Adds a new project member ' })
    @ApiResponse({
        status: 201
    })
    @ApiBody({type: CreateProjectDto})
    @Post(':pid/member')
    async addProjectMember(@Req() req: any, @Body() createProjectMemberDto: CreateProjectMemberDto) {
        return this.projectsService.addProjectMember(createProjectMemberDto);
    }

    // @ApiBearerAuth()
    @Roles('ADMIN','GERENTE','COORDENADOR_ADM','ANALISTA_ADM','ASSISTENTE_ADM')
    @ApiOperation({ summary: 'Activates a deleted project' })
    @ApiResponse({
        status: 200
    })
    @Post(':id/activate')
    async activate(@Req() req: any, @Param('id') id: number) {
        return this.projectsService.activate(id, req.auditEntry);
    }

}
