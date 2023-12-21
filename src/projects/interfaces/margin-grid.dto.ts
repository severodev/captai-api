import { ApiProperty } from "@nestjs/swagger";
import { FinanceGridItemDto } from "./finance-grid-item.dto";

export class MarginGridDto {
    
    @ApiProperty({ description: 'Remaining part of the planned budget based on the Workplan considering all planned expenses' })
    remainingPlannedMargin: number;

    @ApiProperty({ description: 'List of margin items, headed by their month', isArray: true })
    items: FinanceGridItemDto[];    

}