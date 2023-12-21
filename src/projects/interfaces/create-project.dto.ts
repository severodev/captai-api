import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, IsInt } from "class-validator";
import { CreateProjectMemberDto } from "./create-project-member.dto";

export class CreateProjectDto {

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
    @ApiProperty({ example: '05062098', description: 'Payment Order' })
    paymentOrder?: string;

    @IsString()
    @ApiProperty({ example: 'Example Name', description: 'Project manager name' })
    projectManager?: string;

    @IsString()
    @ApiProperty({ example: 'Example Name', description: 'Project Coordinator name' })
    projectCoordinator?: string;

    @IsString()
    @ApiProperty({ description: 'Notes on the project' })
    notes?: string;

    @ApiProperty({ description: 'List of members' })
    projectMembers?: CreateProjectMemberDto[];

    @ApiProperty({ description: 'List of documents IDs' })
    documents?: number[];

}