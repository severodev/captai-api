import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger/dist';
import { I18n, I18nContext } from 'nestjs-i18n';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../roles/roles.decorator';
import { AllExceptionsFilter } from '../../_filters/all-exceptions.filter';
import { AddExpenseDocumentDto } from '../interfaces/add-expense-document.dto';
import { CreateExpenseDto } from '../interfaces/create-expense.dto';
import { ExpenseDto } from '../interfaces/expense.dto';
import { ExpenseService } from '../services/expense.service';

@UseGuards(JwtAuthGuard)
@ApiTags('Expenses')
@Controller('expenses')
@UseFilters(AllExceptionsFilter)
export class ExpensesController {

    constructor(        
        private expenseService: ExpenseService) { }

    @ApiBearerAuth()
    @Roles('ADMIN', 'GERENTE', 'COORDENADOR_ADM', 'ANALISTA_ADM', 'ASSISTENTE_ADM', 'ESTAG_ADM', 'ANALISTA_FIN','ESTAG_FIN','ESTAG_DP','ESTAG_OFI')
    @ApiOperation({ summary: 'Creates a new expense' })
    @ApiResponse({
        status: 201,
        type: ExpenseDto,
        isArray: true,
        description: 'Representation of the created expense'
    })
    @Post()
    async create(@Req() req: any, @Body() dto: CreateExpenseDto) {
        return this.expenseService.create(dto, req.auditEntry);
    }

    @ApiBearerAuth()
    @Roles('ADMIN', 'GERENTE', 'COORDENADOR_ADM', 'ANALISTA_ADM', 'ASSISTENTE_ADM', 'ESTAG_ADM', 'ANALISTA_FIN','ESTAG_FIN','ESTAG_DP','ESTAG_OFI')
    @ApiOperation({ summary: 'Creates a new expense' })
    @ApiResponse({
        status: 201,
        type: ExpenseDto,
        isArray: true,
        description: 'Representation of the created expense'
    })
    @Post('/document')
    async addDocument(@Req() req: any, @Body() dto: AddExpenseDocumentDto) {
        return this.expenseService.addDocument(dto, req.auditEntry);
    }

    @ApiBearerAuth()
    @Roles('ADMIN', 'GERENTE', 'COORDENADOR_ADM', 'ANALISTA_ADM', 'ASSISTENTE_ADM', 'ESTAG_ADM', 'ANALISTA_FIN','ESTAG_FIN','ESTAG_DP','ESTAG_OFI')
    @ApiOperation({ summary: 'Updates an existing expense' })
    @ApiResponse({
        status: 201
    })
    @Put()
    async update(@Req() req: any, @Body() dto: ExpenseDto) {
        return this.expenseService.update(dto, req.auditEntry);
    }

    @ApiBearerAuth()
    @Roles('ADMIN','GERENTE','COORDENADOR_ADM','ANALISTA_ADM','ASSISTENTE_ADM')
    @ApiOperation({ summary: 'Gets an existing expense' })
    @ApiResponse({
        status: 200
    })
    @Get(':id')
    async get(@Req() req: any, @Param('id') id: number, @I18n() i18n: I18nContext) {
        return this.expenseService.get(id, i18n, req.auditEntry);
    }

    @ApiBearerAuth()
    @Roles('ADMIN','GERENTE','COORDENADOR_ADM','ANALISTA_ADM','ASSISTENTE_ADM')
    @ApiOperation({ summary: 'Gets an existing expense' })
    @ApiResponse({
        status: 200
    })
    @Get('project/:projectId')
    async getByProject(@Req() req: any, @Param('projectId') projectId: number, 
        @Query('orderby') orderby, @Query('desc') desc: number, 
        @Query('expenseStatus') expenseStatus: string, @I18n() i18n: I18nContext) {
        return this.expenseService.getExpensesByProject(projectId, orderby, (desc && desc > 0), expenseStatus, undefined, i18n, req.auditEntry);
    }

    @ApiBearerAuth()
    @Roles('ADMIN', 'GERENTE', 'COORDENADOR_ADM', 'ANALISTA_ADM', 'ASSISTENTE_ADM')
    @ApiOperation({ summary: 'Deletes an existing expense' })
    @ApiResponse({
        status: 200
    })
    @Delete(':id')
    async delete(@Req() req: any, @Param('id') id: number, @I18n() i18n: I18nContext) {
        return this.expenseService.delete(id, i18n, req.auditEntry);
    }

    @ApiBearerAuth()
    @Roles('ADMIN', 'GERENTE', 'COORDENADOR_ADM', 'ANALISTA_ADM', 'ASSISTENTE_ADM')
    @ApiOperation({ summary: 'Activates a deleted expense' })
    @ApiResponse({
        status: 200
    })
    @Post(':id/activate')
    async activate(@Req() req: any, @Param('id') id: number, @I18n() i18n: I18nContext) {
        return this.expenseService.activate(id, i18n, req.auditEntry);
    }

    @ApiBearerAuth()
    @Roles('ADMIN', 'GERENTE', 'COORDENADOR_ADM', 'ANALISTA_ADM', 'ASSISTENTE_ADM')
    @ApiOperation({ summary: 'Confirms a payment for a given expense, and optionally to a specific installment' })
    @ApiResponse({
        status: 200
    })
    @Put(':id/confirmPayment/:expenseInstallmentId')
    async confirmPayment(@Req() req: any, @Param('id') expenseId: number, @Param('expenseInstallmentId') expenseInstallmentId: number, @I18n() i18n: I18nContext) {
        return this.expenseService.confirmExpensePayment(expenseId, expenseInstallmentId, i18n, req.auditEntry);
    }

}
