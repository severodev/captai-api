import { ApiProperty } from "@nestjs/swagger";
import { IsInt } from "class-validator";

export class AddExpenseDocumentDto {
    
    @IsInt()
    @ApiProperty({ example: 10, description: 'The expense ID'})
    expenseId: number;    

    @IsInt()
    @ApiProperty({ example: 57, description: 'The document ID'})
    documentId: number;    

}