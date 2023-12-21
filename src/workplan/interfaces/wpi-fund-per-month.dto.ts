import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNumber } from "class-validator";
import { WorkplanItemDto } from "./workplan-item.dto";

export class WPIFundPerMonthDto {

    @IsInt()
    @ApiProperty({ example: '1', description: 'WPI fund per month' })
    id: number;

    @IsNumber()
    @ApiProperty({ example: '10' })
    month: number;

    @IsNumber()
    @ApiProperty({ example: '2000' })
    year: number;

    @IsNumber()
    @ApiProperty({ example: '10' })
    value: number;

    @ApiProperty({ description: 'Workplan item', type: WorkplanItemDto })
    workplanItem: WorkplanItemDto;

}
