import { ApiProperty } from "@nestjs/swagger";
import { IsDecimal, IsInt, IsString } from "class-validator";
import { PaymentDto } from "../../collaborators/interfaces/payment.dto";
import { BudgetCategory } from "../entity/budget-category.entity";
import { CostShare } from "../entity/cost-sharing.entity";
import { ExpenseStatusEnum } from "../enums/expense-status.enum";
import { DocumentDto } from "./../../documents/interfaces/document.dto";
import { BudgetCategoryDto } from "./budget-category.dto";
import { CostShareDto } from "./cost-share.dto";
import { ExpenseInstallmentDto } from "./expense-installment.dto";
import { SupplierDto } from "./supplier.dto";
import { TripExpenseDetailsDto } from "./trip-expense-details.dto";

export class ExpenseDto {
    
    @IsInt()
    @ApiProperty({ example: '210', description: 'The expense ID'})
    id: number;  

    @ApiProperty({ description: 'The expense supplier', type: SupplierDto})
    supplier?: SupplierDto;

    @IsString()
    @ApiProperty({ description: 'The expense description'})
    description: string;

    @IsString()
    @ApiProperty({ example: '2021-03-01', description: 'The expense request date' })
    requestDate: string;

    @IsString()
    @ApiProperty({ example: '2021-05-01', description: 'The expense limit date to pay' })
    dueDate?: string;

    @IsString()
    @ApiProperty({ example: '2021-04-01', description: 'The expense date of payment' })
    paymentDate?: string;

    @IsString()
    @ApiProperty({ example: '2021-04-05', description: 'The expense assets/service delivery date' })
    deliveryDate?: string;

    @IsDecimal()
    @ApiProperty({ example: '340.00', description: 'The expense value'})
    value: number;

    @IsString()
    @ApiProperty({ example: 'Atraso', description: 'The expense status', enum: ExpenseStatusEnum, default: ExpenseStatusEnum.PLANNED })
    status?: string;
    
    @IsInt()
    @ApiProperty({ description: 'The expense budget category', enum: BudgetCategoryDto })
    budgetCategory: BudgetCategoryDto;
    
    @ApiProperty({ description: 'The list of projects sharing this expense along with their sharing quote', type: CostShareDto, isArray: true })
    costShare?: CostShareDto[];
    
    @ApiProperty({ description: 'The expense documents', type: DocumentDto, isArray: true })
    documents?: DocumentDto[];

    @ApiProperty({ required: false, description: 'The trip expense details', type: TripExpenseDetailsDto })
    tripDetails?: TripExpenseDetailsDto;

    @ApiProperty({ description: 'The expense installments', type: ExpenseInstallmentDto, isArray: true })
    installments?: ExpenseInstallmentDto[];

}