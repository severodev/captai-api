import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger/dist';
import { I18n, I18nContext } from 'nestjs-i18n';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AllExceptionsFilter } from '../../_filters/all-exceptions.filter';
import { CreateSupplierDto } from '../interfaces/create-supplier.dto';
import { SupplierCardDto } from '../interfaces/supplier-card.dto';
import { SupplierDropdownDto } from '../interfaces/supplier-dropdown.dto';
import { SupplierDto } from '../interfaces/supplier.dto';
import { UpdateSupplierDto } from '../interfaces/update-supplier.dto';
import { BudgetCategoryService } from '../services/budgetCategory.service';
import { SuppliersService } from '../services/suppliers.service';
import { Roles } from './../../roles/roles.decorator';
import { PaginationMetadataDto } from './../../util/interfaces/pagination-metadata.dto';
import { Request } from 'express';

@UseGuards(JwtAuthGuard)
@ApiTags('Suppliers')
@Controller('suppliers')
@UseFilters(AllExceptionsFilter)
export class SuppliersController {

    constructor(private suppliersService: SuppliersService,
        private budgetCategoryService: BudgetCategoryService) { }

    @Roles('ADMIN', 'GERENTE', 'COORDENADOR_ADM', 'ANALISTA_ADM', 'ASSISTENTE_ADM', 'ESTAG_ADM', 'ANALISTA_FIN','ESTAG_FIN','ESTAG_DP','ESTAG_OFI')
    @Get('pagination')
    async cardsPages(@Query('search') search: string,
        @Query('itemsPerPage') itemsPerPage = 10,
        @Query('isActive') isActive = true): Promise<PaginationMetadataDto> {
        return this.suppliersService.pagination(search, itemsPerPage, isActive);
    }

    @Roles('ADMIN', 'GERENTE', 'COORDENADOR_ADM', 'ANALISTA_ADM', 'ASSISTENTE_ADM', 'ESTAG_ADM', 'ANALISTA_FIN','ESTAG_FIN','ESTAG_DP','ESTAG_OFI')
    @Get('dropdown')
    async dropdown(@Query('search') search: string): Promise<SupplierDropdownDto[]> {
        return this.suppliersService.filteredCompact(search, true);
    }

    @Roles('ADMIN', 'GERENTE', 'COORDENADOR_ADM', 'ANALISTA_ADM', 'ASSISTENTE_ADM', 'ESTAG_ADM', 'ANALISTA_FIN','ESTAG_FIN','ESTAG_DP','ESTAG_OFI')
    @Get('cards')
    async cards(@Query('search') search: string, @Query('orderby') orderby: string,
        @Query('desc') desc: number, @Query('itemsPerPage') itemsPerPage = 10,
        @Query('page') page = 1, @Query('isActive') isActive = true): Promise<SupplierCardDto[]> {
        return this.suppliersService.filteredCards(search, orderby, (desc && desc > 0), itemsPerPage, page, isActive);
    }

    // @Roles('ADMIN', 'GERENTE', 'COORDENADOR_ADM', 'ANALISTA_ADM', 'ASSISTENTE_ADM', 'ESTAG_ADM', 'ANALISTA_FIN','ESTAG_FIN','ESTAG_DP','ESTAG_OFI')
    // @Get('csv')
    // async csv(@Query('search') search, @Query('orderby') orderby,
    //     @Query('desc') desc: number, @Query('itemsPerPage') itemsPerPage: number = 10,
    //     @Query('page') page: number = 1, @Res() res, @I18n() i18n: I18nContext) {

    //     const csvReport: CollaboratorCSVReport = await this.suppliersService.csv(search, orderby,
    //         (desc && desc > 0), itemsPerPage, page, i18n);
    //     if (csvReport) {
    //         res.attachment(csvReport.filename);
    //         return res.status(200).send(csvReport.content);
    //     } else {
    //         throw new InternalServerErrorException("Falha ao gerar relatório");
    //     }
    // }

    @ApiBearerAuth()
    @Roles('ADMIN', 'GERENTE', 'COORDENADOR_ADM', 'ANALISTA_ADM', 'ASSISTENTE_ADM', 'ESTAG_ADM', 'ANALISTA_FIN','ESTAG_FIN','ESTAG_DP','ESTAG_OFI')
    @ApiOperation({ summary: 'Creates a new supplier' })
    @ApiResponse({
        status: 201
    })
    @Post()
    async create(@Req() req: Request, @Body() createSupplierDto: CreateSupplierDto): Promise<SupplierCardDto> {
        // console.log(':: Controller ::');
        // console.log(createCollaboratorDto);        
        return this.suppliersService.create(createSupplierDto, (req as any).auditEntry);
    }

    @ApiBearerAuth()
    @Roles('ADMIN', 'GERENTE', 'COORDENADOR_ADM', 'ANALISTA_ADM', 'ASSISTENTE_ADM', 'ESTAG_ADM', 'ANALISTA_FIN','ESTAG_FIN','ESTAG_DP','ESTAG_OFI')
    @ApiOperation({ summary: 'Updates an existing supplier' })
    @ApiResponse({
        status: 201
    })
    @Put()
    async update(@Req() req: Request, @Body() updateSupplierDto: UpdateSupplierDto): Promise<boolean> {
        // console.log(':: Controller ::');
        // console.log(createCollaboratorDto);        
        return this.suppliersService.update(updateSupplierDto, (req as any).auditEntry);
    }

    @ApiBearerAuth()
    @Roles('ADMIN','GERENTE','COORDENADOR_ADM','ANALISTA_ADM','ASSISTENTE_ADM')
    @ApiOperation({ summary: 'Gets an existing collaborator' })
    @ApiResponse({
        status: 200
    })
    @Get(':id')
    async get(@Req() req: Request, @Param('id') id: number, @I18n() i18n: I18nContext): Promise<SupplierDto> {
        return this.suppliersService.get(id, i18n, (req as any).auditEntry);
    }

    @ApiBearerAuth()
    @Roles('ADMIN', 'GERENTE', 'COORDENADOR_ADM', 'ANALISTA_ADM', 'ASSISTENTE_ADM')
    @ApiOperation({ summary: 'Deletes an existing supplier' })
    @ApiResponse({
        status: 200
    })
    @Delete(':id')
    async delete(@Req() req: Request, @Param('id') id: number, @I18n() i18n: I18nContext): Promise<boolean> {
        return this.suppliersService.delete(id, i18n, (req as any).auditEntry);
    }

    @ApiBearerAuth()
    @Roles('ADMIN', 'GERENTE', 'COORDENADOR_ADM', 'ANALISTA_ADM', 'ASSISTENTE_ADM')
    @ApiOperation({ summary: 'Activates a deleted supplier' })
    @ApiResponse({
        status: 200
    })
    @Post(':id/activate')
    async activate(@Req() req: Request, @Param('id') id: number, @I18n() i18n: I18nContext): Promise<boolean> {
        return this.suppliersService.activate(id, i18n, (req as any).auditEntry);
    }

}
