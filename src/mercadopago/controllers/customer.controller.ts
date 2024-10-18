/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Body, Controller, Param, Post, Req, UseFilters } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MercadoPagoConfig, Customer, CardToken, CustomerCard, PreApproval } from 'mercadopago';
import { AllExceptionsFilter } from 'src/_filters/all-exceptions.filter';
import { CustomerDto } from './../interfaces/customer-dto';
var crypto = require('crypto');

@ApiTags('Customer (Cliente)')
@Controller('/mp/customer')
@UseFilters(AllExceptionsFilter)
export class CustomerController {

    constructor() {
    }

    @Post('/register')
    async register(@Req() req: any, @Body() createCustomerDto: CustomerDto) {
        const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_KEY, options: { timeout: 5000 } });
        const mpCustomerService = new Customer(client);
        const requestOptions = {
            idempotencyKey: crypto.randomUUID(),
        };
        try {
            const result = await mpCustomerService.create({
                body: {
                    email: createCustomerDto.email,
                    first_name: createCustomerDto.firstName,
                    last_name: createCustomerDto.lastName,
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

