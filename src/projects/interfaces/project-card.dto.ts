import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString, IsDecimal, IsNumber, IsBoolean } from "class-validator";
import { Institute } from "../../institutes/entity/institute.entity";

export class ProjectCardDto {

    @IsInt()
    @ApiProperty({ example: '1', description: 'Project ID' })
    id: number;

    @IsString()
    @ApiProperty({ example: 'DAL Platform', description: 'Project name' })
    name: string;    

    @IsNumber()
    @ApiProperty({ example: '55000', description: 'Remaining budget for this project (available for use)' })
    remainingBudget?: number;

    @IsDecimal()
    @ApiProperty({ example: '0.73', description: 'Overall progress of the project regarding its closing date' })
    progress?: number;

    @IsBoolean()
    @ApiProperty({ description: 'Indicates if the project workplan is complete (or have at least on item)' })
    workplanComplete?: boolean;

    @IsNumber()
    @ApiProperty({ example: '27', description: 'Number of project members' })
    totalMembers?: number;

    @IsDecimal()
    @ApiProperty({ example: '0.05', description: 'Percentage of remaining funds for this project' })
    remainingMarginPercentage?: number;

    @IsDecimal()
    @ApiProperty({ example: '0.95', description: 'Percentage of funds utilized in this project' })
    utilizedFundsPercentage?: number;

    @IsNumber()
    @ApiProperty({ example: '55000', description: 'Project total expensives' })
    totalExpensives?: number;

    institute?: Institute;

}