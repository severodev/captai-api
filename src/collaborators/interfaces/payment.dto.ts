import { BudgetCategoryDto } from "../../suppliers/interfaces/budget-category.dto";
import { CollaboratorDto } from "./collaborator.dto";
import { EmploymentRelationshipDto } from "./employment-relationship.dto";
import { PaymentComponentDto } from "./payment-component.dto";

export class PaymentDto {
    
    id: number;    
    year: string;
    month: string;
    totalValue: number;  
    
    budgetCategory: BudgetCategoryDto;
    components: PaymentComponentDto[];
    paid?: boolean;

    collaboratorInfo?:string;
    collaborator?: CollaboratorDto;
    employmentRelationship?: EmploymentRelationshipDto;
    jobTitle?: string;
}