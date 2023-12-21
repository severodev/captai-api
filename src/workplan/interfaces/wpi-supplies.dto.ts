import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString } from "class-validator";

export class WPISuppliesDto {

    @IsInt()
    @ApiProperty({ example: '1', description: 'Supplies WPI ID' })
    id: number;

    @IsInt()
    @ApiProperty({ example: '7', description: 'Workplan Item ID' })
    workplanItemId: number;

    @IsString()
    @ApiProperty({ description: 'Description' })
    description: string;

    @IsInt()
    @ApiProperty({ example: '10'})
    quantity: number;

    @IsString()
    @ApiProperty({ description: 'Accounting Appropriation Form' })
    accountingAppropriation: string;

}