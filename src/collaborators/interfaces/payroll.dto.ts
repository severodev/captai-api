import { InstituteDto } from "../../institutes/interfaces/institute.dto";
import { BudgetCategoryDto } from "../../suppliers/interfaces/budget-category.dto";
import { ProjectDto } from "./../../projects/interfaces/project.dto";
import { EmploymentRelationshipDto } from "./employment-relationship.dto";

export interface PayRollDto {
    id: number;    
    active: boolean;
    jobTitle: string;
    admission: string;
    dismissal?: string;
    salary: number;
    workload: number;
    
    institute: InstituteDto;  
    employmentRelationship: EmploymentRelationshipDto;  
    project?: ProjectDto;
    budgetCategory?: BudgetCategoryDto;
}