
import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString } from "class-validator";

export class InstituteDto {

    @IsInt()
    @ApiProperty({ example: '1', description: 'Institute ID' })
    id: number;   

    @IsString()
    @ApiProperty({ example: 'IEPRO', description: 'Institute short name' })
    abbreviation: string;

    @IsString()
    @ApiProperty({ example: 'Instituto de Estudos, Pesquisas e Projetos da UECE', description: 'Institute name' })
    name?: string;
}