import { ApiProperty } from "@nestjs/swagger";
import { IsDecimal, IsInt } from "class-validator";
import { ProjectDto } from "../../projects/interfaces/project.dto";

export class CreateCostShareDto {
    
    @IsInt()
    @ApiProperty({ example: '1', description: 'The project ID' })
    projectId: number;

    @IsDecimal()
    @ApiProperty({ example: '254.90', description: 'The shared expense value' })
    value: number;
}