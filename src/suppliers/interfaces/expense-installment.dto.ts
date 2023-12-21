import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsInt, IsNumber, IsString } from "class-validator";
import { ProjectDto } from "../../projects/interfaces/project.dto";
import { ExpenseDto } from "./expense.dto";

export class ExpenseInstallmentDto {
    
    @IsInt()
    @ApiProperty({ example: '555', description: 'The expense installment ID'})
    id?: number;  

    @ApiProperty({ description: 'The expense to which the installment refers', type: ExpenseDto})
    expenese?: ExpenseDto;

    @IsNumber()
    @ApiProperty({ description: 'Installment order', example: '3' })
    order?: number;

    @IsString()
    @ApiProperty({ description: 'Installment description', example: 'Contract security depoist' })
    description?: string;

    @IsDate()
    @ApiProperty({ description: 'Installment payment date', example: '10/01/2022' })
    paymentDate?: Date;

    @IsNumber()
    @ApiProperty({ description: 'Installment month', example: '10' })
    month?: number;

    @IsNumber()
    @ApiProperty({ description: 'Installment year',example: '2000' })
    year?: number;

    @IsNumber()
    @ApiProperty({ description: 'Installment value', example: '10' })
    value: number;

    @IsNumber()
    @ApiProperty({ description: 'Installment status regarding payment', example: false })
    isPaid?: boolean;

    @ApiProperty({ description: 'Project responsible for paying this installment' })
    project?: ProjectDto;

}