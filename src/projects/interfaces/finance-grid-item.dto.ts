import { ApiProperty } from "@nestjs/swagger";

export class FinanceGridItemDto {
    
    @ApiProperty({ example:'MAR', description: 'Month label for this set of finance information' })
    monthLabel: string;

    @ApiProperty({ example:'2021', description: 'Year label for this set of finance information' })
    yearLabel: string;

    @ApiProperty({example: 4200.9, description: 'Total value for this month' })
    periodValue: number;

    @ApiProperty({ example: '{ "HR_DIRECT": 4500, "TRIP": 2000, "SERVICE_OTHER": 980.5 }', description: 'Map month information, headed by their budget category' })
    financeHeadings: Map<string, number>;
}