import { CreateBenefitDto } from "./create-benefit.dto";

export interface CreatePayRollDto {

    id?: number;
    
    jobTitle: string;

    admission: string;
    
    dismissal?: string;
    
    project: number;

    institute: number;

    employmentRelationship: number;

    budgetCategory: number;
    
    salary: number;
    
    workload: number;

    isProfessorRelationship: boolean;

    benefits?: CreateBenefitDto[];
}