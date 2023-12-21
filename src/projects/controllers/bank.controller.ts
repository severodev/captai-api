/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Req, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { I18nRequestScopeService } from 'nestjs-i18n';
import { Roles } from '../../roles/roles.decorator';
import { AllExceptionsFilter } from '../../_filters/all-exceptions.filter';
import { BankDropdownDto } from '../interfaces/bank-dropdown.dto';
import { BankDto } from '../interfaces/bank.dto';
import { CreateBankDto } from '../interfaces/create-bank.dto';
import { BankService } from '../services/bank.service';
import { JwtAuthGuard } from './../../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@ApiTags('Banks')
@UseFilters(AllExceptionsFilter)
@Controller('bank')
export class BankController {

    constructor(private readonly bankService: BankService,
        private readonly i18n: I18nRequestScopeService) { }

    @Get('dropdown')
    dropdown(): Promise<BankDropdownDto[]> {
        return this.bankService.dropdown();
    }

    @ApiBearerAuth()
    @Roles('ADMIN', 'GERENTE', 'COORDENADOR_ADM', 'ANALISTA_ADM', 'ASSISTENTE_ADM', 'ESTAG_ADM', 'ANALISTA_FIN','ESTAG_FIN','ESTAG_DP','ESTAG_OFI')
    @ApiOperation({ summary: 'Creates a new bank' })
    @ApiResponse({
        status: 201
    })
    @Post()
    async create(@Req() req: any, @Body() createBankDto: CreateBankDto) {
        return this.bankService.create(createBankDto, req.auditEntry);
    }

    @ApiBearerAuth()
    @Roles('ADMIN', 'GERENTE', 'COORDENADOR_ADM', 'ANALISTA_ADM', 'ASSISTENTE_ADM', 'ESTAG_ADM', 'ANALISTA_FIN','ESTAG_FIN','ESTAG_DP','ESTAG_OFI')
    @ApiOperation({ summary: 'Updates an existing bank' })
    @ApiResponse({
        status: 201
    })
    @Put(':id')
    async update(@Req() req: any, @Param('id', ParseIntPipe) id: number, @Body() bankDto: BankDto) {

        if (bankDto.id && bankDto.id > 0 && bankDto.id !== id) {
            throw new BadRequestException(
                await this.i18n.translate('bank.ID_MISMATCH', {
                    args: { id: bankDto.id },
                })
            );
        }
        bankDto.id = id;

        return this.bankService.update(bankDto, req.auditEntry);
    }

    @ApiBearerAuth()
    @Roles('ADMIN','GERENTE','COORDENADOR_ADM','ANALISTA_ADM','ASSISTENTE_ADM')
    @ApiOperation({ summary: 'Deletes an existing bank' })
    @ApiResponse({
        status: 200
    })
    @Delete(':id')
    async delete(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
        return this.bankService.delete(id, req.auditEntry);
    }

    @ApiBearerAuth()
    @Roles('ADMIN','GERENTE','COORDENADOR_ADM','ANALISTA_ADM','ASSISTENTE_ADM')
    @ApiOperation({ summary: 'Activates a deleted bank' })
    @ApiResponse({
        status: 200
    })
    @Post(':id/activate')
    async activate(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
        return this.bankService.activate(id, req.auditEntry);
    }

}
