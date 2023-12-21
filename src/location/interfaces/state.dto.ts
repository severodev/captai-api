import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString } from "class-validator";

export class StateDto {
    @IsInt()
    @ApiProperty({ example: '1', description: 'State ID' })
    id: number;

    @IsString()
    @ApiProperty({ example: 'CE', description: 'State abbreviation' })
    abbreviation: string;

    @IsString()
    @ApiProperty({ example: 'Ceará', description: 'State name' })
    name?: string;

    @IsString()
    @ApiProperty({ example: 'BRA', description: 'Country abbreviation' })
    country?: string;
}