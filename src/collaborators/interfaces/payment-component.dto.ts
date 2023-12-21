import { BenefitDto } from "./benefit.dto";

export class PaymentComponentDto {
    
    id: number;    
    type: string;
    description?: string;
    
    value: number;
    leadCompensation: number;

}