import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString } from "class-validator";

export class CreateProjectMemberDto {

    @IsInt()
    @ApiProperty({ example: '1', description: 'Project Member ID' })
    id?: number;

    @IsInt()
    @ApiProperty({ example: 23, description: 'Collaborator ID' })
    collaborator: number;

    @IsInt()
    @ApiProperty({ example: 7, description: 'Project ID' })
    project: number;
    
    @IsString()
    @ApiProperty({ example: 'Web Developer', description: 'Collaborator job title on the project' })
    jobTitle: string;


}