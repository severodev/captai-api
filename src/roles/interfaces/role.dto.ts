import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString } from "class-validator";

export class RoleDto {

    @IsInt()
    @ApiProperty({ example: '1', description: 'Role ID' })
    id: number;

    @IsString()
    @ApiProperty({ example: 'GERENTE', description: 'Role type' })
    type: string;

    @IsInt()
    @ApiProperty({ example: 'Gerente', description: 'Role name' })
    name?: string;

    @IsInt()
    @ApiProperty({ example: '1', description: 'Role level'})
    level: number;

}