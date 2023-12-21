import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Put, UseFilters } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { ContributionsService } from '../services/contributions.service';
import { CreateContributionDto } from '../interfaces/create-contribution.dto';
import { UpdateContributionDto } from '../interfaces/update-contribution.dto';
import { Roles } from '../../../roles/roles.decorator';
import { Request } from 'express';
import { BudgetTransferDto } from '../../../projects/interfaces/budget-transfer.dto';
import { AllExceptionsFilter } from '../../../_filters/all-exceptions.filter';

@UseGuards(JwtAuthGuard)
@ApiTags('Contributions')
@Controller('contributions')
@UseFilters(AllExceptionsFilter)
export class ContributionsController {
  constructor(private readonly contributionsService: ContributionsService) {}

  @ApiBearerAuth()
  @Roles('ADMIN','GERENTE','COORDENADOR_ADM','ANALISTA_ADM','ASSISTENTE_ADM')
  @Post()
  create(@Req() req: Request, @Body() createContributionDto: CreateContributionDto) {
    return this.contributionsService.create(createContributionDto, (req as any).auditEntry);
  }

    @ApiBearerAuth()
    @Roles('ADMIN','GERENTE','COORDENADOR_ADM','ANALISTA_ADM','ASSISTENTE_ADM')
    @ApiOperation({ summary: 'Transfers reamining budget from ending project to another project' })
    @ApiResponse({
        status: 200
    })
    @Put('transfer')
    async transferBetweenProjects(@Req() req: any, @Body() budgetTransferDto: BudgetTransferDto) {
        return this.contributionsService.transferBetweenProjects(budgetTransferDto, req.auditEntry);
    }

  @ApiBearerAuth()
  @Roles('ADMIN','GERENTE','COORDENADOR_ADM','ANALISTA_ADM','ASSISTENTE_ADM')
  @Get('contributionsReceivedInTableStyle/:projectId')
  contributionsReceivedInTableStyle(@Param('projectId') projectId : number){
    return this.contributionsService.contributionsReceivedInTableStyle(projectId);
  }

  @ApiBearerAuth()
  @Roles('ADMIN','GERENTE','COORDENADOR_ADM','ANALISTA_ADM','ASSISTENTE_ADM')
  @Get('informationAboutContributions/:projectId')
  InformationAboutContributionsByProjectId(@Param('projectId') projectId : number){
    return this.contributionsService.InformationAboutContributionsByProjectId(projectId);
  }

  @ApiBearerAuth()
  @Roles('ADMIN','GERENTE','COORDENADOR_ADM','ANALISTA_ADM','ASSISTENTE_ADM')
  @Get('notConfirmedContributions/:projectId')
  findValueOfAllNotConfirmedContributionsByProjectId(@Param('projectId') projectId : number){
    return this.contributionsService.findValueOfAllNotConfirmedContributionsByProjectId(projectId);
  }

  @ApiBearerAuth()
  @Roles('ADMIN','GERENTE','COORDENADOR_ADM','ANALISTA_ADM','ASSISTENTE_ADM')
  @Get('activeContributions/:projectId')
  findValueOfAllContributionsByProjectId(@Param('projectId') projectId : number) {
    return this.contributionsService.findValueOfAllContributionsByProjectId(projectId);
  }

  @ApiBearerAuth()
  @Roles('ADMIN','GERENTE','COORDENADOR_ADM','ANALISTA_ADM','ASSISTENTE_ADM')
  @Get('confirmedContributions/:projectId')
  findValueOfAllConfirmedContributionsByProjectId(@Param('projectId') projectId : number) {
    return this.contributionsService.findValueOfAllConfirmedContributionsByProjectId(projectId);
  }

  @ApiBearerAuth()
  @Roles('ADMIN','GERENTE','COORDENADOR_ADM','ANALISTA_ADM','ASSISTENTE_ADM')
  @Get()
  findAllContributions() {
    return this.contributionsService.findAllContributions();
  }

  @ApiBearerAuth()
  @Roles('ADMIN','GERENTE','COORDENADOR_ADM','ANALISTA_ADM','ASSISTENTE_ADM')
  @Get(':contributionId')
  findContributionById(@Param('contributionId') contributionId: number){
    return this.contributionsService.findContributionById(contributionId);
  }

  @ApiBearerAuth()
  @Roles('ADMIN','GERENTE','COORDENADOR_ADM','ANALISTA_ADM','ASSISTENTE_ADM')
  @Get('confirmContribution/:contributionId')
  confirmContribution(@Req() req: Request, @Param('contributionId') contributionId: number) {
    return this.contributionsService.confirmContribution(contributionId, (req as any).auditEntry);
  }

  @ApiBearerAuth()
  @Roles('ADMIN','GERENTE','COORDENADOR_ADM','ANALISTA_ADM','ASSISTENTE_ADM')
  @Get('project/:projectId')
  findContributionsByProjectId(@Param('projectId') projectId: number) {
    return this.contributionsService.findContributionsByProjectId(projectId);
  }

  @ApiBearerAuth()
  @Roles('ADMIN','GERENTE','COORDENADOR_ADM','ANALISTA_ADM','ASSISTENTE_ADM')
  @Patch(':contributionId')
  update(@Req() req: Request, @Param('contributionId') contributionId: number, @Body() updateContributionDto: UpdateContributionDto) {
    return this.contributionsService.update(contributionId, updateContributionDto, (req as any).auditEntry);
  }

  @ApiBearerAuth()
  @Roles('ADMIN','GERENTE','COORDENADOR_ADM','ANALISTA_ADM','ASSISTENTE_ADM')
  @Delete(':contributionId')
  remove(@Req() req: Request, @Param('contributionId') contributionId: number) {
    return this.contributionsService.remove(contributionId, (req as any).auditEntry);
  }
}
