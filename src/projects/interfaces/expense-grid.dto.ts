import { ApiProperty } from "@nestjs/swagger";
import { FinanceGridItemDto } from "./finance-grid-item.dto";

export class ExpenseGridDto {
    
    @ApiProperty({ description: 'Sum of all planned and executed expenses' })
    totalExpenses: number;    

    @ApiProperty({ description: 'Remaining part of the budget considering all planned expenses' })
    remainingRealMargin: number;

    @ApiProperty({ description: 'List of expenses items, headed by their month', isArray: true })
    items: FinanceGridItemDto[];

    // @ApiProperty({ description: 'Top budget catergories on expenses ranking' })
    // expensesRanking: ExpensesRankingItemDto[];
    
}