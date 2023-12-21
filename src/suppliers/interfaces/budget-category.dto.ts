import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString } from "class-validator";

export class BudgetCategoryDto {

    @IsInt()
    @ApiProperty({ example: '2', description: 'The budget category ID'})
    id: number;  

    @IsString()
    @ApiProperty({ description: 'The budget category code'})
    code?: string;

    @IsString()
    @ApiProperty({ description: 'The budget category description'})
    name: string;
}