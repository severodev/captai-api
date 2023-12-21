import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString } from "class-validator";
import { CollaboratorDropdownDto } from "./../../collaborators/interfaces/collaborator-dropdown.dto";

export class ProjectMemberDto {

    @IsInt()
    @ApiProperty({ example: '1', description: 'Project member ID' })
    id: number;

    @IsInt()
    @ApiProperty({ example: '1', description: 'Project ID' })
    project: number;

    @ApiProperty({ description: 'Collaborator information' })
    collaborator: CollaboratorDropdownDto;

    @IsString()
    @ApiProperty({ example: 'Web Developer', description: 'Collaborator job title on the project' })
    jobTitle: string;

}