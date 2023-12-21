import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString } from "class-validator";

export class CreateWPISuppliesDto {

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