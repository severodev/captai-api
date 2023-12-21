import { PayRollDto } from "./payroll.dto";

export interface CollaboratorDropdownDto {
    id: number;    
    name?: string;
    socilName?: string;
    image?: string;
    active?: boolean;
    payRoll?: PayRollDto[];
}