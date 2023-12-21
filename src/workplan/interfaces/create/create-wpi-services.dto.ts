import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString } from "class-validator";

export class CreateWPIServiceDto {

    @IsString()
    @ApiProperty({ description: 'The contractor name' })
    contractorName: string;

    @IsString()
    @ApiProperty({ example: '000.000.000-00', description: 'The contractor cpf' })
    cpf: string;

    @IsString()
    @ApiProperty({ example: '00.189.234.877/0001-19', description: 'The contractor cnpj' })
    cnpj?: string;

    @IsString()
    @ApiProperty({ description: 'Description' })
    description: string;

    @IsString()
    @ApiProperty({ example: '2021-03-01', description: 'Service start date' })
    start?: string;

    @IsString()
    @ApiProperty({ example: '2021-06-20', description: 'Service end date' })
    end?: string;

}