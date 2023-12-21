import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString } from "class-validator";

export class ProjectDropdownDto {

    @IsInt()
    @ApiProperty({ example: '1', description: 'Project ID' })
    id: number;    

    @IsString()
    @ApiProperty({ example: 'DAL Platform', description: 'Project name' })
    name: string;

    @IsString()
    @ApiProperty({ example: 'IEPRO', description: 'Institute short name' })
    institute?: string;

    @IsString()
    @ApiProperty({ example: '2022-03-01', description: 'Project start date' })
    start?: Date;

    @IsString()
    @ApiProperty({ example: '2023-03-31', description: 'Project end date' })
    end?: Date;
}