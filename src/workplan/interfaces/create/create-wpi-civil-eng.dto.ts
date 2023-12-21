import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString } from "class-validator";

export class CreateWPICivilEngineeringDto {

    @IsString()
    @ApiProperty({ example: '25', description: 'Supplier ID' })
    supplierId?: number;

    @IsString()
    @ApiProperty({ description: 'Supplier name' })
    supplierName: string;

    @IsString()
    @ApiProperty({ description: 'Description' })
    description: string;

    @IsString()
    @ApiProperty({ description: 'Accounting Appropriation Form' })
    accountingAppropriation: string;

}