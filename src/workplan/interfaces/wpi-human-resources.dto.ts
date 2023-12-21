import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNumber, IsString } from "class-validator";
export class WPIHumanResourcesDto {

    @IsInt()
    @ApiProperty({ example: '1', description: 'Human Resources WPI Details Item ID' })
    id: number;

    @IsInt()
    @ApiProperty({ example: '7', description: 'Workplan Item ID' })
    workplanItemId: number;

    @IsString()
    @ApiProperty({ example: 'Designer', description: 'The job name for the person hired as project member' })
    jobTitle: string;

    @IsNumber()
    @ApiProperty({ example: 'Graduate', description: 'Required educational level for the job posistion' })
    educationLevel: string;

    @IsInt()
    @ApiProperty({ example: '40', description: 'Amount of work hours per month for the job posistion' })
    workingHours?: number;

}