import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString } from "class-validator";

export class WPIInstituteCostDto {

    @IsInt()
    @ApiProperty({ example: '1', description: 'Institute Cost WPI ID' })
    id: number;

    @IsInt()
    @ApiProperty({ example: '7', description: 'Workplan Item ID' })
    workplanItemId: number;

    @IsString()
    @ApiProperty({ description: 'Institut cost description' })
    description: string;

}