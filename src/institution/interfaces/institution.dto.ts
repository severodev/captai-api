
import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString } from "class-validator";

export class InstitutionDto {

    @IsInt()
    @ApiProperty({ example: '1', description: 'Institution ID' })
    id: number;   

    @IsString()
    @ApiProperty({ example: 'CAPES', description: 'Institution short name' })
    abbreviation: string;

    @IsString()
    @ApiProperty({ example: 'Coordenação de Aperfeiçoamento de Pessoal de Nível Superior', description: 'Institution name' })
    name?: string;
}