import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString } from "class-validator";

export class CreateWPIInstituteCostDto {

    @IsString()
    @ApiProperty({ description: 'Institut cost description' })
    description: string;

}