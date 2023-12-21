import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsDate, IsNumber } from "class-validator";

export class BudgetTransferDto {

    @IsInt()
    @ApiProperty({ example: '1', description: 'Donating Project ID' })
    donatingProjectId: number;
    
    @IsInt()
    @ApiProperty({ example: '1', description: 'Receiving Project ID' })
    receivingProjectId: number;

    @IsNumber()
    @ApiProperty({ example: '100.000', description: 'Amount donated' })
    donatedAmount: number;
    
    @IsDate()
    @ApiProperty({ example: '01/01/2022', description: 'Date of the transfer'})
    transferDate?: Date;
}