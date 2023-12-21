import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsInt, IsNumber } from "class-validator";

export class CreateContributionDto {

    @IsNumber()
    @ApiProperty({ example: '55000', description: 'Amount of contributions received' })
    amount: number;

    @IsNumber()
    @ApiProperty({ example: '5', description: 'Project ID' })
    project: number;

    @IsDate()
    @ApiProperty({ example: new Date(), description: 'Date of receipt of the contribution'})
    receiptDate: Date;

    @IsBoolean()
    @ApiProperty({ example: false, description: 'Is true when the type of contribution is transfer'})
    isTransfer: boolean;

    @IsDate()
    @ApiProperty({ example: new Date(), description: 'Date of transfer'})
    transferDate: Date;
}
