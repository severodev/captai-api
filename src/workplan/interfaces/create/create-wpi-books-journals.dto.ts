import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString } from "class-validator";

export class CreateWPIBooksJournalsDto {

    @IsString()
    @ApiProperty({ description: 'Work title' })
    workTitle: string;

    @IsInt()
    @ApiProperty({ example: '10'})
    quantity: number;

}