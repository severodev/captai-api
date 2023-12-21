import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString } from "class-validator";

export class WPIBooksJournalsDto {

    @IsInt()
    @ApiProperty({ example: '1', description: 'Books and Journals WPI ID' })
    id: number;

    @IsInt()
    @ApiProperty({ example: '7', description: 'Workplan Item ID' })
    workplanItemId: number;

    @IsString()
    @ApiProperty({ description: 'Work title' })
    workTitle: string;

    @IsInt()
    @ApiProperty({ example: '10'})
    quantity: number;

}