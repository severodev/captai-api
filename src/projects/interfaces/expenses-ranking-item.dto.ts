import { ApiProperty } from "@nestjs/swagger";

export class ExpensesRankingItemDto {
    
    @ApiProperty({ example:2, description: 'Position of the budget category in the ranking' })
    order: number;

    @ApiProperty({ example:'Viagem', description: 'Name of budget category' })
    name: string;

    @ApiProperty({example: 3000, description: 'Remaining financial margin for this month' })
    value: number;
}