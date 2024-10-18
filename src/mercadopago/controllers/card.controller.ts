/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Body, Controller, Param, Post, Query, Req, UseFilters } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MercadoPagoConfig, Customer, CardToken, CustomerCard, PreApproval } from 'mercadopago';
import { AllExceptionsFilter } from 'src/_filters/all-exceptions.filter';
import { CardDto } from './../interfaces/card-dto';
var crypto = require('crypto');

@ApiTags('Card (Cartão)')
@Controller('/mp/card')
@UseFilters(AllExceptionsFilter)
export class CardController {

    constructor() {
    }

    @Post('/register')
    async register(@Req() req: any, @Body() data: CardDto) {
        const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_KEY, options: { timeout: 5000 } });
        const mpCustomerCardService = new CustomerCard(client);
        const requestOptions = {
            idempotencyKey: crypto.randomUUID(),
        };
        try {
            const result = await mpCustomerCardService.create({
                customerId: data.customerId,
                body: {
                    token: data.cardToken,
                },
                requestOptions
            });
            return result;
        } catch (error) {
            console.error(error);
            return { status: "error", message: error.message, code: error.code };
        }
    }

}

