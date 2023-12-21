import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";
import { BudgetCategoryEnum } from "../enums/budget-category.enum";
import { MonthInfos } from "./month-infos.dto";
export class WorkplanPlannedItemDto {
    @IsString()
    @ApiProperty({ example: 'RH_DIRECT', description: 'The workplan category', enum: BudgetCategoryEnum })
    name: string;
    @IsNumber()
    @ApiProperty({ example: '55000', description: 'Expected value to be consumed by this workplan item' })
    amount: number;
    @ApiProperty({ description: 'Months of planned workplans.' })
    months: MonthInfos[];
    
}