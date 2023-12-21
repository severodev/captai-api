import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString } from "class-validator";
export class CityDto {

    @IsInt()
    @ApiProperty({ example: '1', description: 'City ID' })
    id: number;

    @IsString()
    @ApiProperty({ example: 'Fortaleza', description: 'City name' })
    name: string;

    @IsString()
    @ApiProperty({ example: 'CE', description: 'State abbreviation' })
    state: string;

    @IsString()
    @ApiProperty({ example: 'BRA', description: 'Country abbreviation' })
    country?: string;
}