import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNumber, IsString } from "class-validator";
export class CreateWPIHumanResourcesDto {

    @ApiProperty({ example: 'Designer', description: 'The job name for the person hired as project member' })
    jobTitle: string;

    @ApiProperty({ example: 'Graduate', description: 'Required educational level for the job posistion' })
    educationLevel: string;

    @ApiProperty({ example: '40', description: 'Amount of work hours per month for the job posistion' })
    workingHours?: number;

}