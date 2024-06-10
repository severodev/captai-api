/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Body, Controller, Param, Post, Req, UseFilters } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MercadoPagoConfig, Payment, PreApproval } from 'mercadopago';
import { AllExceptionsFilter } from 'src/_filters/all-exceptions.filter';

interface SubscriptionPlan {
    id: number;
    internalPlanCode: string;
    name: string;
    description: string;
    value: number;
    freeDays: number;
    coveredFeatures: string[];
    notCoveredFeatures: string[];
    mercadoPagoPlanId: string;
}

@ApiTags('Assinatura (Pagamento Recorrente)')
@Controller('/mp/subscription')
@UseFilters(AllExceptionsFilter)
export class SubscriptionController {

    availablePlans: SubscriptionPlan[];

    constructor(
    ) {
        this.availablePlans = [
            {
                id: 1,
                internalPlanCode: 'CAPTI-PLANO-1',
                name: "Plano Pessoa Física [TESTE]",
                description: "O melhor para o profissional e sua equipe.",
                value: 1,
                freeDays: 1,
                coveredFeatures: ["Pesquisar"],
                notCoveredFeatures: ["Captar (EM BREVE)", "Categorizar (EM BREVE)", "Priorizar (EM BREVE)", "Gerenciar tarefas (EM BREVE)", "Dashboard pessoal (EM BREVE)"],
                mercadoPagoPlanId: '2c9380848fde7fa4018feebed0f50549'
            },
            {
                id: 2,
                internalPlanCode: 'CAPTI-PLANO-2',
                name: "Plano Pessoa Jurídica [TESTE]",
                description: "O melhor para o profissional e sua equipe.",
                value: 2,
                freeDays: 1,
                coveredFeatures: ["Pesquisar"],
                notCoveredFeatures: ["Captar (EM BREVE)", "Categorizar (EM BREVE)", "Priorizar (EM BREVE)", "Gerenciar tarefas (EM BREVE)", "Dashboard pessoal (EM BREVE)"],
                mercadoPagoPlanId: '2c9380848fde7fa4018feec0da1005ad'
            }
        ];
    }

    @Post('/register/:idPlan')
    async register(@Req() req: any, @Param('idPlan') idPlan: string) {

        if(!idPlan || idPlan.length === 0){
            return;
        }

        const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_KEY, options: { timeout: 5000 } });
        const preApproval = new PreApproval(client);
        const requestOptions = {
            idempotencyKey: crypto.randomUUID(),
        };

        const plan = this.availablePlans.find(p => p.id == parseInt(idPlan));
        try {
            const result = await preApproval.create({
                body: {
                    card_token_id: req.body.token,
                    preapproval_plan_id: plan.mercadoPagoPlanId,
                    payer_email: req.body.payer.email,
                    status: 'authorized',
                    back_url: 'https://www.captirecursos.com.br/',
                    external_reference: plan.internalPlanCode
                },
                requestOptions
            });
            return result;
        } catch (error) {
            console.error(error);
            return { status: "error", message: error.message, code: error.code };
        }

    }

    @Post('/webhook')
    async subscriptionWebhook(@Req() req: any) {

        try {
           
            console.log('Subscription webhook was fired');
            console.log(req.body);

        } catch (error) {
            console.error(error);
            return { status: "error", message: error.message, code: error.code };
        }

    }

}

