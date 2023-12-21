import { ApiProperty } from "@nestjs/swagger";
import { IsDecimal, IsInt, IsNumber, IsString } from "class-validator";
import { DocumentDto } from "../../documents/interfaces/document.dto";
import { InstituteDto } from "../../institutes/interfaces/institute.dto";
import { ExpenseDto } from "../../suppliers/interfaces/expense.dto";
import { WorkplanItemDto } from "../../workplan/interfaces/workplan-item.dto";
import { MarginGridDto } from "./margin-grid.dto";
import { ExecutedExpenseDto } from "./executed-expense.dto";
import { ProjectMemberDto } from "./project-member.dto";
import { BankDropdownDto } from "./bank-dropdown.dto";
import { ExpenseGridDto } from "./expense-grid.dto";
import { PaymentDto } from "../../collaborators/interfaces/payment.dto";

export class ProjectDetailsDto {

    @IsInt()
    @ApiProperty({ example: '1', description: 'Project ID' })
    id: number;

    @IsString()
    @ApiProperty({ example: 'DAL Platform', description: 'Project name' })
    name: string;

    @IsNumber()
    @ApiProperty({ example: '169865.6', description: 'Total expenses of a project also adding the payment amounts' })
    headerTotalExpenses: number;

    @IsString()
    @ApiProperty({ example: 'A fully accessible web platform for tranning on technology, business and much more', description: 'Project description' })
    description?: string;

    @IsString()
    @ApiProperty({ example: '2020-01-01', description: 'Project start date' })
    start: string;

    @IsString()
    @ApiProperty({ example: '2020-09-01', description: 'Project end date' })
    end: string;

    @IsInt()
    @ApiProperty({ example: '1', description: 'Institute ID' })
    institute: InstituteDto;

    @IsNumber()
    @ApiProperty({ example: '55000', description: 'Project start budget' })
    budget?: number;

    @IsString()
    @ApiProperty({ example: '2020AMT-163', description: 'Amendment term identifier' })
    amendmentTerm?: string;

    @IsInt()
    @ApiProperty({ description: 'Bank' })
    bank: BankDropdownDto;

    @IsString()
    @ApiProperty({ example: '11243-7', description: 'Bank agency number' })
    bankAgency?: string;

    @IsString()
    @ApiProperty({ example: '000678912-0', description: 'Bank account number' })
    bankAccount?: string;

    @IsString()
    @ApiProperty({ description: 'Notes on the project' })
    notes?: string;

    @ApiProperty({ description: 'List of members' })
    projectMembers?: ProjectMemberDto[];

    @ApiProperty({ description: 'List of documents' })
    documents?: DocumentDto[];

    @ApiProperty({ description: 'List of expenses' })
    expenses?: ExpenseDto[];

    @ApiProperty({ description: 'List of HR Payments' })
    hrPayments?: PaymentDto[];    

    @ApiProperty({ description: 'Project budget margins distributed by financial headings through months' })
    marginsGrid?: MarginGridDto;

    @ApiProperty({ description: 'Project planned and executed expenses distributed by financial headings through months' })
    expensesGrid?: ExpenseGridDto;

    @ApiProperty({ description: 'Executed expenses linked to the project' })
    executedExpenses?: ExecutedExpenseDto[];

    @ApiProperty({ description: 'Workplan items (Planned Expenses)' })
    workplan?: WorkplanItemDto[];

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

}