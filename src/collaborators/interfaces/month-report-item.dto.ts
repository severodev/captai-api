import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString } from "class-validator";
import { ProjectDropdownDto } from "../../projects/interfaces/project-dropdown.dto";
import { PayRollDto } from "./payroll.dto";

export class MonthReportItemDto {

    payroll: PayRollDto;
    sent: boolean;
    activities?: string;
    lastUpdate?: string;
    
}