import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString } from "class-validator";

export class WPICorrelatedDto {

    @IsInt()
    @ApiProperty({ example: '1', description: 'Correlated WPI ID' })
    id: number;

    @IsInt()
    @ApiProperty({ example: '7', description: 'Workplan Item ID' })
    workplanItemId: number;

    @IsString()
    @ApiProperty({ example: '25', description: 'Supplier ID' })
    supplierId?: number;

    @IsString()
    @ApiProperty({ description: 'The supplier name' })
    supplierName: string;

    @IsString()
    @ApiProperty({ description: 'Description' })
    description: string;

    @IsString()
    @ApiProperty({ description: 'Accounting Appropriation Form' })
    accountingAppropriation: string;

}