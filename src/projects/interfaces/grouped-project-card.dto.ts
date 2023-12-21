import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";
import { InstituteDto } from "../../institutes/interfaces/institute.dto";
import { ProjectCardDto } from "./project-card.dto";


export class GroupedProjectCardDto {
    
    @ApiProperty({ description: 'Institute' })
    institute: InstituteDto;

    @ApiProperty({ description: 'List of projects', type: ProjectCardDto, isArray: true })
    projects: ProjectCardDto[];

}