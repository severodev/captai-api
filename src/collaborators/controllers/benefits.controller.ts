import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BenefitDropdownDto } from '../interfaces/benefit-dropdown.dto';
import { BenefitsService } from '../services/benefits.service';
import { JwtAuthGuard } from './../../auth/jwt-auth.guard';
import { Roles } from './../../roles/roles.decorator';
import { BenefitDto } from '../interfaces/benefit.dto';
import { CreateBenefitDto } from '../interfaces/create-benefit.dto';
import { I18nContext, I18n } from 'nestjs-i18n';
import { BenefitTypeDto } from '../interfaces/benefit-type.dto';
import { AllExceptionsFilter } from '../../_filters/all-exceptions.filter';

@UseGuards(JwtAuthGuard)
@ApiTags('Benefits')
@Controller('benefits')
@UseFilters(AllExceptionsFilter)
export class BenefitsController {
  constructor(private benefitsService: BenefitsService) {}

  @Roles(
    'ADMIN',
    'GERENTE',
    'COORDENADOR_ADM',
    'ANALISTA_ADM',
    'ASSISTENTE_ADM',
    'ESTAG_ADM',
  )
  @Get('dropdown')
  async dropdown(): Promise<BenefitDropdownDto[]> {
    return this.benefitsService.dropdown();
  }

  @Roles(
    'ADMIN',
    'GERENTE',
    'COORDENADOR_ADM',
    'ANALISTA_ADM',
    'ASSISTENTE_ADM',
    'ESTAG_ADM',
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Creates a new project' })
  @ApiResponse({ status: 201 })
  @Post()
  async create(
    @Req() req: any,
    @Body() createBenefitDto: CreateBenefitDto,
    @I18n() i18n: I18nContext,
  ) {
    return this.benefitsService.create(createBenefitDto, req.auditEntry, i18n);
  }

  @ApiBearerAuth()
  @Roles(
    'ADMIN',
    'GERENTE',
    'COORDENADOR_ADM',
    'ANALISTA_ADM',
    'ASSISTENTE_ADM',
    'ESTAG_ADM',
  )
  @ApiOperation({ summary: 'Updates an existing project' })
  @ApiResponse({ status: 200 })
  @Put(':id')
  async update(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBenefitDto: BenefitDto,
    @I18n() i18n: I18nContext,
  ) {
    if (
      updateBenefitDto.id &&
      updateBenefitDto.id > 0 &&
      updateBenefitDto.id !== id
    ) {
      throw new BadRequestException(
        await i18n.translate('benefit.ID_MISMATCH', {
          args: { id: updateBenefitDto.id },
        }),
      );
    }

    updateBenefitDto.id = id;
    return this.benefitsService.update(updateBenefitDto, req.auditEntry, i18n);
  }

  @Get('grantedTypes')
  async benefitTypess(
    @Query('idInstitute') idInstitute: number,
    @Query('idER') idER: number,
  ): Promise<BenefitTypeDto[]> {
    return this.benefitsService.grantedTypes(idInstitute, idER);
  }

  @Get('grantedBenefits')
  async benefits(
    @Query('idInstitute') idInstitute: number,
    @Query('idER') idER: number,
    @Query('idPayroll') idPayroll?: number,
  ): Promise<BenefitDto[]> {
    return this.benefitsService.buildGrantedBenefits(
      idPayroll,
      idER,
      idInstitute,
    );
  }
}
