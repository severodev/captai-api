import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNumber, IsString } from "class-validator";
import { CreateProjectMemberDto } from "./create-project-member.dto";
import { ProjectMemberDto } from "./project-member.dto";

export class UpdateProjectDto {

    @IsInt()
    @ApiProperty({ example: '1', description: 'Project ID' })
    id?: number;

    @IsString()
    @ApiProperty({ example: 'DAL Platform', description: 'Project name' })
    name: string;

    @IsString()
    @ApiProperty({ example: 'A fully accessible web platform for tranning on technology, business and much more', description: 'Project description' })
    description?: string;

    @IsString()
    @ApiProperty({ example: '2020-01-01', description: 'Project start date' })
    start: string;

    @IsString()
    @ApiProperty({ example: '2020-09-01', description: 'Project end date' })
    end: string;

    @IsInt()
    @ApiProperty({ example: '1', description: 'Institute ID' })
    institute: number;

    @IsNumber()
    @ApiProperty({ example: '55000', description: 'Project start budget' })
    budget: number;

    @IsString()
    @ApiProperty({ example: '2020AMT-163', description: 'Amendment term identifier' })
    amendmentTerm?: string;

    @IsInt()
    @ApiProperty({ example: '1', description: 'Bank ID' })
    bank: number;

    @IsString()
    @ApiProperty({ example: '11243-7', description: 'Bank agency number' })
    bankAgency?: string;

    @IsString()
    @ApiProperty({ example: '000678912-0', description: 'Bank account number' })
    bankAccount?: string;

    @IsString()
    @ApiProperty({ description: 'Notes on the project' })
    notes?: string;

    @IsString()
    @ApiProperty({ description: '012345'})
    paymentOrder?: string;
    
    @IsString()
    @ApiProperty({ description: 'Project Manager'})
    projectManager?: string;
    
    @IsString()
    @ApiProperty({ description: 'Project Coordinator'})
    projectCoordinator?: string;

    @ApiProperty({ description: 'List of members' })
    projectMembers?: CreateProjectMemberDto[];

    @ApiProperty({ description: 'List of documents IDs' })
    documents?: number[];

}