import { ApiProperty } from "@nestjs/swagger";
import { IsDecimal, IsInt, IsString } from "class-validator";
import { BudgetCategoryEnum } from "../../workplan/enums/budget-category.enum";
import { ExpenseStatusEnum } from "../enums/expense-status.enum";
import { CreateCostShareDto } from "./create-cost-share.dto";
import { ExpenseInstallmentDto } from "./expense-installment.dto";
import { TripExpenseDetailsDto } from "./trip-expense-details.dto";

export class CreateExpenseDto {
    
    @IsInt()
    @ApiProperty({ example: 10, description: 'The project ID'})
    supplierId: number;    

    @IsString()
    @ApiProperty({ description: 'The expense description'})
    description: string;

    @IsString()
    @ApiProperty({ example: '2021-03-01', description: 'The expense request date' })
    requestDate: string;

    @IsString()
    @ApiProperty({ required: false, example: '2021-05-01', description: 'The expense limit date to pay' })
    dueDate?: string;

    @IsString()
    @ApiProperty({ required: false, example: '2021-04-01', description: 'The expense date of payment' })
    paymentDate?: string;

    @IsString()
    @ApiProperty({ required: false, example: '2021-04-05', description: 'The expense assets/service delivery date' })
    deliveryDate?: string;

    @IsDecimal()
    @ApiProperty({ example: '340.00', description: 'The expense value'})
    value: number;

    @IsString()
    @ApiProperty({ required: false, example: 'Atraso', description: 'The expense status', enum: ExpenseStatusEnum, default: ExpenseStatusEnum.PLANNED })
    status?: string;

    @IsInt()
    @ApiProperty({ example: 3, description: 'The expense budget category ID', enum: BudgetCategoryEnum })
    budgetCategoryId: number;

    @ApiProperty({ required: false, description: 'The list of projects sharing this expense along with their sharing quote', type: CreateCostShareDto })
    costShare?: CreateCostShareDto[];
    
    @ApiProperty({ required: false, description: 'The expense documents IDs', type: 'number', example: [1,4,5,9], isArray: true })
    documents?: number[];

    @ApiProperty({ required: false, description: 'The trip expense details', type: TripExpenseDetailsDto })
    tripDetails?: TripExpenseDetailsDto;

    @ApiProperty({ required: false, description: 'The expense installments', type: ExpenseInstallmentDto })
    installments?: ExpenseInstallmentDto[];
}