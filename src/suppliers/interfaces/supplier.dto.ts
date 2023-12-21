import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString } from "class-validator";
import { ExpenseDto } from "./expense.dto";

export class SupplierDto {
    id: number;

    name: string;

    companyName?: string;

    budgetCategoryId: number;

    budgetCategory: string;

    cnpj: string;

    email?: string;

    website?: string;

    phoneMain?: string;

    phoneSecondary?: string;

    address: string;

    postalCode: string;

    notes?: string;

    state?: number;

    stateStr?: string;

    city?: number;

    cityStr?: string;

    @IsInt()
    @ApiProperty({ example: '1', description: 'Bank ID' })
    bank: number;

    @IsString()
    @ApiProperty({ example: '11243-7', description: 'Bank agency number' })
    bankAgency?: string;

    @IsString()
    @ApiProperty({ example: '000678912-0', description: 'Bank account number' })
    bankAccount?: string;

    @ApiProperty({ description: 'List of documents IDs' })
    documents?: number[];

    expenses?: ExpenseDto[];
}