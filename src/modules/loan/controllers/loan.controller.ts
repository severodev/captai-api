import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, UseFilters } from '@nestjs/common';
import { LoanService } from '../services/loan.service';
import { CreateLoanDto } from '../interfaces/create-loan.dto';
import { UpdateLoanDto } from '../interfaces/update-loan.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { Roles } from '../../../roles/roles.decorator';
import { AllExceptionsFilter } from '../../../_filters/all-exceptions.filter';

@UseGuards(JwtAuthGuard)
@ApiTags('Loans')
@Controller('loans')
@UseFilters(AllExceptionsFilter)
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  @ApiBearerAuth()
  @Roles('ADMIN','GERENTE','COORDENADOR_ADM','ANALISTA_ADM','ASSISTENTE_ADM')
  @Post()
  create(@Req() req: Request, @Body() createLoanDto: CreateLoanDto) {
    return this.loanService.create(createLoanDto, (req as any).auditEntry);
  }

  @ApiBearerAuth()
  @Roles('ADMIN','GERENTE','COORDENADOR_ADM','ANALISTA_ADM','ASSISTENTE_ADM')
  @Get('informationAboutLoans/:projectId')
  InformationAboutLoansByProjectId(@Param('projectId') projectId : number){
    return this.loanService.InformationAboutLoansByProjectId(projectId);
  }

  @ApiBearerAuth()
  @Roles('ADMIN','GERENTE','COORDENADOR_ADM','ANALISTA_ADM','ASSISTENTE_ADM')
  @Get('confirmLoan/:loanId')
  confirmLoan(@Req() req: Request, @Param('loanId') loanId: number) {
    return this.loanService.confirmLoan(loanId, (req as any).auditEntry);
  }

  @ApiBearerAuth()
  @Roles('ADMIN','GERENTE','COORDENADOR_ADM','ANALISTA_ADM','ASSISTENTE_ADM')
  @Get('returnLoan/:loanId')
  returnLoan(@Req() req: Request, @Param('loanId') loanId: number) {
    return this.loanService.returnLoan(loanId, (req as any).auditEntry);
  }

  @ApiBearerAuth()
  @Roles('ADMIN','GERENTE','COORDENADOR_ADM','ANALISTA_ADM','ASSISTENTE_ADM')
  @Get()
  findAllLoans() {
    return this.loanService.findAllLoans();
  }

  @ApiBearerAuth()
  @Roles('ADMIN','GERENTE','COORDENADOR_ADM','ANALISTA_ADM','ASSISTENTE_ADM')
  @Get(':loanId')
  findLoanById(@Param('loanId') loanId: number){
    return this.loanService.findLoanById(loanId);
  }
  
  @ApiBearerAuth()
  @Roles('ADMIN','GERENTE','COORDENADOR_ADM','ANALISTA_ADM','ASSISTENTE_ADM')
  @Get('project/received/:projectId')
  findLoansReceivedByProjectId(@Param('projectId') projectId: number) {
    return this.loanService.findLoansReceivedByProjectId(projectId);
  }

  @ApiBearerAuth()
  @Roles('ADMIN','GERENTE','COORDENADOR_ADM','ANALISTA_ADM','ASSISTENTE_ADM')
  @Get('project/given/:projectId')
  findLoansGivenByProjectId(@Param('projectId') projectId: number) {
    return this.loanService.findLoansGivenByProjectId(projectId);
  }

  @ApiBearerAuth()
  @Roles('ADMIN','GERENTE','COORDENADOR_ADM','ANALISTA_ADM','ASSISTENTE_ADM')
  @Patch(':loanId')
  update(@Req() req: Request, @Param('loanId') loanId: number, @Body() updateLoanDto: UpdateLoanDto) {
    return this.loanService.update(loanId, updateLoanDto, (req as any).auditEntry);
  }

  @ApiBearerAuth()
  @Roles('ADMIN','GERENTE','COORDENADOR_ADM','ANALISTA_ADM','ASSISTENTE_ADM')
  @Delete(':loanId')
  remove(@Req() req: Request, @Param('loanId') loanId: number) {
    return this.loanService.remove(loanId, (req as any).auditEntry);
  }
}
