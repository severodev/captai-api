import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateWPITrainingDto {

    @IsString()
    @ApiProperty({ example: 'Power BI Training', description: 'The title of the course/training' })
    title: string;
    
    @IsString()
    @ApiProperty({ description: 'The instructor name' })
    instructorName?: string;

    @IsString()
    @ApiProperty({ example: '00.189.234.877/0001-19', description: 'The instructor/company cnpj' })
    cnpj?: string;

    @IsString()
    @ApiProperty({ example: '2021-03-01', description: 'Training start date' })
    start?: string;

    @IsString()
    @ApiProperty({ example: '2021-03-20', description: 'Training end date' })
    end?: string;

}