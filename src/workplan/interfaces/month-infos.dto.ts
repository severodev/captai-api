import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";
export class MonthInfos {
    @IsString()
    @ApiProperty({ example: 'Julho/2022', description: 'Information with month and year' })
    name: string;
    @IsNumber()
    @ApiProperty({ example: '55000', description: 'Expected value to be consumed by this workplan item' })
    amount: number;    
}