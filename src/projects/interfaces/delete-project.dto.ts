import { ApiProperty } from "@nestjs/swagger";
import { IsInt } from "class-validator";

export class DeleteProjectDto {

    @IsInt()
    @ApiProperty({ example: '1', description: 'Project ID' })
    id: number;

}