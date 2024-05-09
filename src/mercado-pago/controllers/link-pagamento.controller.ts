/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Body, Controller, Post, Req, UseFilters, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AllExceptionsFilter } from '../../_filters/all-exceptions.filter';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { FeednackPagamentoDto } from '../interfaces/feedback-pagamento.dto';

@ApiTags('Mercado Pago - Link de Pagamento')
@Controller('mercado-pago/link-pagamento')
@UseFilters(AllExceptionsFilter)
export class LinkPagamentoController {

    constructor() { }

    @ApiOperation({ summary: 'Feedback de pagamento de Link de Pagamento com sucesso' })
    @ApiResponse({ status: 201 })
    @Post("/sucesso")
    async sucesso(@Req() req: any, @Body() resultado: FeednackPagamentoDto) {
        return;
    }

    @ApiOperation({ summary: 'Feedback de pagamento de Link de Pagamento com sucesso' })
    @ApiResponse({ status: 201 })
    @Post("/falha")
    async falha(@Req() req: any, @Body() resultado: FeednackPagamentoDto) {
        return;
    }

}
