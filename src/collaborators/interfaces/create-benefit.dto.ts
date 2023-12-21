import { BenefitTypeDto } from "./benefit-type.dto";

export class CreateBenefitDto {

    id?: number;

    benefitType: BenefitTypeDto;

    description?: string;
    amountValue?: number;
    amountType?: string;
    deductionValue?: number;
    deductionType?: string;

    instituteId?: number;
    projectId?: number;
    collaboratorId?: number;

    toString(): string {
        const value = this.amountType == 'R$' ?  `${this.amountType} ${this.amountValue}` : `${this.amountValue} ${this.amountType}`;
        const deduction = this.deductionType == 'R$' ?  `- ${this.deductionType} ${this.deductionValue}` : `- ${this.deductionValue} ${this.deductionType}`;
        return `${this.benefitType.name} (${value}, ${deduction})`;
    }
}